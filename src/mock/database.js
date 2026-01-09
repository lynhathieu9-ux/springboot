// 模拟后端根据SQL表结构返回的聚合数据
export const getActiveResidentsData = () => {
  // 对应 residents 表，过滤 status = '入住'
  // 根据SQL数据，id 6 和 7 是入住状态
  const residents = [
    {
      id: 6,
      name: '李牛花',
      age: 75,
      gender: '女',
      room_number: '301',
      bed_number: '301-A',
      photo: '/avatar/f1.png',
      risk_level: 'high', // 衍生字段：根据预警表
    },
    {
      id: 7,
      name: '唐莹',
      age: 70,
      gender: '女',
      room_number: '302',
      bed_number: '302-A',
      photo: '/avatar/f2.png',
      risk_level: 'medium',
    },
    // 为了大屏效果，模拟更多数据
    { id: 99, name: '张大爷', age: 82, gender: '男', room_number: '101', bed_number: '101-A', risk_level: 'low' },
    { id: 100, name: '刘奶奶', age: 78, gender: '女', room_number: '102', bed_number: '102-B', risk_level: 'high' }
  ];

  // 模拟关联 health_blood_pressure, health_blood_oxygen 等表获取最新数据
  return residents.map(r => ({
    ...r,
    latestHealth: {
      bp: { systolic: 120 + Math.floor(Math.random()*30), diastolic: 70 + Math.floor(Math.random()*20) }, // 血压
      sugar: { level: 5.4 + Math.random()*2, status: '空腹' }, // 血糖
      oxygen: 95 + Math.floor(Math.random()*4), // 血氧
      temp: 36.5 + Math.random(), // 体温
      hr: 70 + Math.floor(Math.random()*20), // 心率
      sleep: { duration: 7.5, quality: '良' } // 睡眠
    }
  }));
};

// 模拟历史数据生成
export const generateHistoricalData = (days = 7) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      date: dateStr,
      bp: {
        systolic: 120 + Math.floor(Math.random()*30),
        diastolic: 70 + Math.floor(Math.random()*20)
      },
      sugar: 5.4 + Math.random()*2,
      oxygen: 95 + Math.floor(Math.random()*4),
      temp: 36.5 + Math.random(),
      hr: 70 + Math.floor(Math.random()*20)
    });
  }
  
  return data;
};

// 模拟实时数据更新
export const generateRealTimeData = (baseData) => {
  return {
    ...baseData,
    latestHealth: {
      ...baseData.latestHealth,
      bp: {
        systolic: Math.max(90, Math.min(180, baseData.latestHealth.bp.systolic + (Math.random() - 0.5) * 10)),
        diastolic: Math.max(60, Math.min(120, baseData.latestHealth.bp.diastolic + (Math.random() - 0.5) * 8))
      },
      oxygen: Math.max(90, Math.min(100, baseData.latestHealth.oxygen + (Math.random() - 0.5) * 2)),
      temp: Math.max(36.0, Math.min(37.5, baseData.latestHealth.temp + (Math.random() - 0.5) * 0.3)),
      hr: Math.max(60, Math.min(100, baseData.latestHealth.hr + (Math.random() - 0.5) * 10))
    }
  };
};
