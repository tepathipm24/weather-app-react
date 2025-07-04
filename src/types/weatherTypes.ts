export interface WeatherApiResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: CurrentWeatherData;
}

export interface Condition {
  text: string;
  icon: string;
  code: number;
}

export interface CurrentWeatherData {
  last_updated_epoch: number; // Unix Timestamp ของเวลาอัปเดตล่าสุด (Number)
  last_updated: string; // เวลาอัปเดตล่าสุดในรูปแบบ String เช่น "2025-07-05 01:30" (String)

  temp_c: number; // อุณหภูมิเป็นองศาเซลเซียส (Number)
  temp_f: number; // อุณหภูมิเป็นองศาฟาเรนไฮต์ (Number)
  is_day: 0 | 1; // 0 = กลางคืน, 1 = กลางวัน (Number, ใช้ Union Type เพื่อจำกัดค่า)

  condition: Condition; // ข้อมูลสภาพอากาศ (ใช้ Interface Condition ที่สร้างแยก)

  wind_kph: number; // ความเร็วลมเป็นกิโลเมตรต่อชั่วโมง (Number)
  wind_degree: number; // ทิศทางลมเป็นองศา (Number)
  wind_dir: string; // ทิศทางลมเป็นตัวย่อ เช่น "WSW" (String)

  pressure_mb: number; // ความกดอากาศเป็นมิลลิบาร์ (Number)
  humidity: number; // ความชื้นสัมพัทธ์เป็นเปอร์เซ็นต์ (Number)
  cloud: number; // เปอร์เซ็นต์ความหนาเมฆ (Number)

  feelslike_c: number; // อุณหภูมิที่รู้สึกได้เป็นองศาเซลเซียส (Number)
  feelslike_f: number; // อุณหภูมิที่รู้สึกได้เป็นองศาฟาเรนไฮต์ (Number)

  uv: number; // ดัชนีรังสียูวี (Number)

  vis_km: number; // ทัศนวิสัยเป็นกิโลเมตร (Number)
}
