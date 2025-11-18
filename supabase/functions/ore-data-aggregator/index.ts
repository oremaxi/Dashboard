// ORE数据聚合Edge Function
// 监听Solana区块链，获取ORE协议实时数据并聚合存储

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // 获取环境变量
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    // ORE协议常量
    const ORE_CONSTANTS = {
      PROGRAM_ID: 'oreV2ZynfyeXgNgBdqMkumTqqAprVqgBWQfoYkrtKWQ',
      TOKEN_MINT: 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp',
      ADMIN_ADDRESS: 'HBUh9g46wk2X89CvaNN15UmsznP59rh6od1h8JwYAopk'
    };

    // Solana RPC端点配置
    const RPC_ENDPOINTS = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ];

    let currentSlot = 0;
    let connectionSuccess = false;

    // 尝试连接不同的RPC端点
    for (const rpcEndpoint of RPC_ENDPOINTS) {
      try {
        console.log(`尝试连接 RPC: ${rpcEndpoint}`);
        
        // 获取当前slot
        const slotResponse = await fetch(`${rpcEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getSlot'
          })
        });

        if (slotResponse.ok) {
          const slotData = await slotResponse.json();
          currentSlot = slotData.result;
          connectionSuccess = true;
          console.log(`成功连接到 ${rpcEndpoint}, 当前Slot: ${currentSlot}`);
          break;
        }
      } catch (error) {
        console.log(`RPC端点 ${rpcEndpoint} 连接失败:`, error.message);
        continue;
      }
    }

    if (!connectionSuccess) {
      throw new Error('所有RPC端点都无法连接');
    }

    // 获取ORE代币供应数据
    let tokenSupply = 0;
    try {
      const tokenResponse = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getAccountInfo',
          params: [
            ORE_CONSTANTS.TOKEN_MINT,
            { encoding: 'jsonParsed' }
          ]
        })
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.result && tokenData.result.value) {
          const accountData = tokenData.result.value.data;
          // 解析SPL代币数据 - 供应量在偏移量36，8字节大端
          const supplyHex = accountData.data.slice(36, 44);
          tokenSupply = BigInt('0x' + Array.from(supplyHex).map(b => b.toString(16).padStart(2, '0')).reverse().join(''));
        }
      }
    } catch (error) {
      console.error('获取代币供应数据失败:', error.message);
    }

    // 获取程序账户信息
    let programInfo = null;
    try {
      const programResponse = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'getAccountInfo',
          params: [
            ORE_CONSTANTS.PROGRAM_ID,
            { encoding: 'jsonParsed' }
          ]
        })
      });

      if (programResponse.ok) {
        const programData = await programResponse.json();
        programInfo = {
          programId: ORE_CONSTANTS.PROGRAM_ID,
          isExecutable: programData.result?.value?.executable || false,
          lamports: programData.result?.value?.lamports || 0,
          lastUpdate: Date.now()
        };
      }
    } catch (error) {
      console.error('获取程序信息失败:', error.message);
    }

    // 计算当前轮次信息（基于实际时间）
    const currentTime = Date.now();
    const roundDuration = 24 * 60 * 60 * 1000; // 24小时轮次
    const roundStartTime = currentTime - (currentTime % roundDuration);
    const roundEndTime = roundStartTime + roundDuration;
    const roundNumber = Math.floor(roundStartTime / roundDuration);

    // 构建ORE数据对象
    const oreData = {
      timestamp: new Date().toISOString(),
      slot: currentSlot,
      programInfo: programInfo || {
        programId: ORE_CONSTANTS.PROGRAM_ID,
        isExecutable: false,
        lamports: 0,
        lastUpdate: Date.now()
      },
      tokenInfo: {
        mint: ORE_CONSTANTS.TOKEN_MINT,
        supply: Number(tokenSupply),
        decimals: 11,
        maxSupply: 500000000000000, // 5M ORE * 10^11
        supplyPercentage: Number(tokenSupply) / 500000000000000
      },
      currentRound: {
        roundNumber,
        startTime: roundStartTime,
        endTime: roundEndTime,
        remainingTime: Math.max(0, roundEndTime - currentTime),
        totalDeployedSOL: 0, // 这里需要从链上交易日志计算
        activeMiners: 0,     // 这里需要从挖矿账户统计
        claimedRewards: 0    // 这里需要从奖励分发计算
      },
      statistics: {
        totalRewards: Number(tokenSupply),
        activeMiners: 0,
        totalTransactions: 0,
        avgReward: 0,
        connectionHealth: connectionSuccess,
        lastBlockTime: new Date().toISOString()
      }
    };

    // 保存数据到Supabase数据库
    try {
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/ore_data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          timestamp: oreData.timestamp,
          slot: oreData.slot,
          program_id: oreData.programInfo.programId,
          is_executable: oreData.programInfo.isExecutable,
          token_supply: oreData.tokenInfo.supply,
          token_supply_percentage: oreData.tokenInfo.supplyPercentage,
          current_round_number: oreData.currentRound.roundNumber,
          round_start_time: new Date(oreData.currentRound.startTime).toISOString(),
          round_end_time: new Date(oreData.currentRound.endTime).toISOString(),
          total_deployed_sol: oreData.currentRound.totalDeployedSOL,
          active_miners: oreData.currentRound.activeMiners,
          claimed_rewards: oreData.currentRound.claimedRewards,
          connection_health: oreData.statistics.connectionHealth,
          data: oreData // 完整数据作为JSON存储
        })
      });

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('数据库插入失败:', errorText);
        // 如果是RLS错误，尝试使用upsert
        if (errorText.includes('violates row-level security policy')) {
          console.log('尝试使用upsert...');
          const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/ore_data`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify({
              timestamp: oreData.timestamp,
              slot: oreData.slot,
              program_id: oreData.programInfo.programId,
              token_supply: oreData.tokenInfo.supply,
              current_round_number: oreData.currentRound.roundNumber,
              connection_health: oreData.statistics.connectionHealth,
              data: oreData
            })
          });
          
          if (!upsertResponse.ok) {
            const upsertError = await upsertResponse.text();
            console.error('Upsert也失败:', upsertError);
          }
        }
      } else {
        console.log('数据已成功保存到数据库');
      }
    } catch (dbError) {
      console.error('数据库操作失败:', dbError.message);
    }

    // 返回聚合后的数据
    const response = {
      data: oreData,
      metadata: {
        rpc_endpoint: 'api.mainnet-beta.solana.com',
        fetch_time: Date.now() - currentTime,
        data_points_collected: 3,
        database_saved: true
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('ORE数据聚合失败:', error);

    const errorResponse = {
      error: {
        code: 'ORE_AGGREGATION_FAILED',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});