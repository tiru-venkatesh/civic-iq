import { Complaint, FieldWorker, Notification } from "../types";

export interface CityData {
  id: string;
  cityName: string;
  stateName: string;
  isNational?: boolean;
  centerLat: number;
  centerLng: number;
  zoom: number;
  weather: {
    temp: number;
    condition: string;
    rain: number;
    windSpeed: number;
    humidity: number;
    severity: "Low" | "Medium" | "High" | "Critical";
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    unassigned: number;
  };
  wards: {
    name: string;
    activeIncidents: number;
    slaPerformance: string;
  }[];
  aiInsights: string[];
  complaints: Complaint[];
  workers: FieldWorker[];
  notifications: Notification[];
}

export const CITIES_DATA: Record<string, CityData> = {
  mumbai: {
    id: "mumbai",
    cityName: "Mumbai",
    stateName: "Maharashtra",
    centerLat: 19.0760,
    centerLng: 72.8777,
    zoom: 12,
    weather: {
      temp: 28.5,
      condition: "Monsoon Heavy Rain",
      rain: 85,
      windSpeed: 24,
      humidity: 91,
      severity: "High"
    },
    budget: {
      allocated: 8500000,
      spent: 4200000,
      remaining: 4300000,
      unassigned: 1200000
    },
    wards: [
      { name: "K-East Ward (Andheri E)", activeIncidents: 14, slaPerformance: "92%" },
      { name: "H-West Ward (Bandra W)", activeIncidents: 9, slaPerformance: "95%" },
      { name: "F-South Ward (Parel)", activeIncidents: 7, slaPerformance: "88%" },
      { name: "L-Ward (Kurla)", activeIncidents: 11, slaPerformance: "86%" }
    ],
    aiInsights: [
      "Heavy monsoon downpour in K-East ward predicted to elevate WEH pothole severity by +25% in 4 hours.",
      "S.V. Road water main pressure spike correlates with nearby subway construction vibrations.",
      "Kurla market sanitation backlog cleared; pest risk index reduced by 60%."
    ],
    complaints: [
      {
        id: "MUM-2026-001",
        title: "Major Pothole & Sub-base Asphalt Washout on WEH",
        description: "Deep 2-foot asphalt pothole opened near Andheri East metro on Western Express Highway. Heavy rain washed away sub-grade asphalt layer.",
        category: "Road Damage & Potholes",
        status: "Pending",
        latitude: 19.1176,
        longitude: 72.8561,
        address: "WEH Junction, Near Magicbricks WeWork, Andheri East, Mumbai 400069",
        reportedBy: "Priya Kulkarni (Commuter)",
        reportedAt: "2026-07-23T07:15:00Z",
        images: ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: "Andheri metro ke pass bohot bada pothole hai, do-wheelers slip ho rahe hain.",
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T07:15:00Z",
            comment: "Logged via Mumbai Citizen App with geotagged photo.",
            updatedBy: "Citizen Portal"
          }
        ],
        aiAnalysis: {
          classification: "Major Arterial Highway Damage",
          category: "Road Damage & Potholes",
          confidence: 0.98,
          reasoning: "High-density arterial highway asphalt erosion. Monsoon rainfall threatens motorcycle safety.",
          severity: "Critical",
          populationAffected: 18500,
          delayImpactScore: 92,
          budgetRequired: 42000,
          timeToRepairHours: 4,
          priorityScore: 96,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "MUM-2026-002",
        title: "High Pressure Water Main Burst on S.V. Road",
        description: "Ruptured 18-inch water pipe on S.V. Road near Bandra West station. Clean drinking water flooding pedestrian footpaths.",
        category: "Water Leakage",
        status: "Pending",
        latitude: 19.0596,
        longitude: 72.8397,
        address: "Near Bandra Station West, S.V. Road, Bandra, Mumbai 400050",
        reportedBy: "Akash Jadhav (Merchant)",
        reportedAt: "2026-07-23T08:00:00Z",
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:00:00Z",
            comment: "Logged by local merchant near Bandra market.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "High Pressure Water Line Burst",
          category: "Water Leakage",
          confidence: 0.95,
          reasoning: "Submerging pedestrian walkway near Bandra West transit market. Disrupts clean drinking supply.",
          severity: "High",
          populationAffected: 7200,
          delayImpactScore: 78,
          budgetRequired: 68000,
          timeToRepairHours: 5,
          priorityScore: 90,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "MUM-2026-003",
        title: "BEST Bus Stop Shelter Glass Damage & Road Encroachment",
        description: "BEST Bus shelter on LBS Marg has shattered glass panels blocking the bus bay, forcing commuters onto active traffic lanes.",
        category: "BEST Bus Issues",
        status: "Pending",
        latitude: 19.0657,
        longitude: 72.8794,
        address: "LBS Marg Bus Bay, Kurla West, Mumbai 400070",
        reportedBy: "Sunil Mane (Bus Marshal)",
        reportedAt: "2026-07-23T08:30:00Z",
        images: ["https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:30:00Z",
            comment: "Reported by BEST Transport Depot Marshal.",
            updatedBy: "Sunil Mane"
          }
        ],
        aiAnalysis: {
          classification: "Public Transit Infrastructure Hazard",
          category: "BEST Bus Issues",
          confidence: 0.91,
          reasoning: "Shattered glass on bus queue lanes poses injury hazard to passengers.",
          severity: "Medium",
          populationAffected: 3400,
          delayImpactScore: 45,
          budgetRequired: 15000,
          timeToRepairHours: 3,
          priorityScore: 72,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "MUM-2026-004",
        title: "Garbage Overflow & Plastic Blockage at Dadar Market",
        description: "Accumulated market trash blocking stormwater drains near Dadar Flower Market.",
        category: "Garbage Overflow",
        status: "Resolved",
        latitude: 19.0178,
        longitude: 72.8478,
        address: "Dadar Market Alley, Dadar West, Mumbai 400028",
        reportedBy: "Ramesh Thorat",
        reportedAt: "2026-07-22T10:00:00Z",
        images: ["https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: "FW-MUM-1",
        assignedWorkerName: "Rahul Patil",
        completionProof: {
          photos: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80"],
          completedAt: "2026-07-22T14:00:00Z",
          comments: "Sanitation compactor cleared 2.2 tons of wet market garbage."
        },
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-22T10:00:00Z",
            comment: "Logged by Dadar Warden.",
            updatedBy: "System"
          },
          {
            status: "Resolved",
            updatedAt: "2026-07-22T14:00:00Z",
            comment: "Cleared and disinfected.",
            updatedBy: "Rahul Patil"
          }
        ],
        aiAnalysis: {
          classification: "Market Waste Drainage Block",
          category: "Garbage Overflow",
          confidence: 0.96,
          reasoning: "Prevents storm drain water pooling.",
          severity: "High",
          populationAffected: 5000,
          delayImpactScore: 30,
          budgetRequired: 12000,
          timeToRepairHours: 2,
          priorityScore: 80,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-MUM-1",
        name: "Rahul Patil",
        role: "Senior Road Engineer",
        department: "BMC Infrastructure Cell (K-East)",
        status: "Available",
        currentLat: 19.1176,
        currentLng: 72.8561,
        phone: "+91 98201 49182",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
      },
      {
        id: "FW-MUM-2",
        name: "Sneha Deshmukh",
        role: "Hydrology Inspector",
        department: "BMC Water Dept (H-West)",
        status: "Available",
        currentLat: 19.0596,
        currentLng: 72.8397,
        phone: "+91 98192 38102",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: [
      {
        id: "N-MUM-1",
        role: "Admin",
        title: "Monsoon Emergency Warning",
        message: "Heavy rain in Mumbai K-East ward. Priority scores auto-escalated.",
        createdAt: "2026-07-23T08:10:00Z",
        read: false
      }
    ]
  },

  delhi: {
    id: "delhi",
    cityName: "Delhi",
    stateName: "National Capital Territory",
    centerLat: 28.6139,
    centerLng: 77.2090,
    zoom: 12,
    weather: {
      temp: 36.2,
      condition: "Severe Dust & Smog AQI 320",
      rain: 0,
      windSpeed: 8,
      humidity: 42,
      severity: "Critical"
    },
    budget: {
      allocated: 9200000,
      spent: 5100000,
      remaining: 4100000,
      unassigned: 1500000
    },
    wards: [
      { name: "Central Delhi Ward (CP)", activeIncidents: 12, slaPerformance: "91%" },
      { name: "East Delhi Ward (Anand Vihar)", activeIncidents: 18, slaPerformance: "82%" },
      { name: "South Delhi Ward (Saket)", activeIncidents: 8, slaPerformance: "94%" }
    ],
    aiInsights: [
      "AQI elevated to 320 near Anand Vihar; automated anti-smog water cannons deployed.",
      "ITO junction signal outage detected by AI vision cameras; traffic delay rising +18 mins.",
      "Gaziapur waste dumping flagged for emergency drone surveillance."
    ],
    complaints: [
      {
        id: "DEL-2026-001",
        title: "Severe Air Pollution & Open Waste Burning at Anand Vihar",
        description: "Open industrial plastic waste burning behind Anand Vihar ISBT sending thick black toxic fumes into metro concourse and residential colonies.",
        category: "Air Pollution",
        status: "Pending",
        latitude: 28.6469,
        longitude: 77.3162,
        address: "Behind Anand Vihar ISBT Metro Gate 3, East Delhi, Delhi 110092",
        reportedBy: "Vikram Malhotra (Environmental Activist)",
        reportedAt: "2026-07-23T06:45:00Z",
        images: ["https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: "Anand Vihar bus stand ke peeche bohot dhua ho raha hai, kachra jalaya ja raha hai.",
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T06:45:00Z",
            comment: "Reported with photos of active smog plume.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Hazardous Air Quality Violation",
          category: "Air Pollution",
          confidence: 0.99,
          reasoning: "AQI spike near transit hub exceeds safety threshold. High risk to respiratory health.",
          severity: "Critical",
          populationAffected: 32000,
          delayImpactScore: 88,
          budgetRequired: 25000,
          timeToRepairHours: 2,
          priorityScore: 98,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "DEL-2026-002",
        title: "Major Traffic Signal Outage at ITO Junction",
        description: "Four-way traffic lights down at ITO intersection near Vikas Minar causing 3km gridlock across Yamuna bridge.",
        category: "Traffic Congestion",
        status: "Pending",
        latitude: 28.6289,
        longitude: 77.2405,
        address: "ITO Chowk, Deen Dayal Upadhyaya Marg, New Delhi 110002",
        reportedBy: "Traffic Inspector R.S. Tomar",
        reportedAt: "2026-07-23T08:10:00Z",
        images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:10:00Z",
            comment: "Logged by Delhi Traffic Police Command Center.",
            updatedBy: "R.S. Tomar"
          }
        ],
        aiAnalysis: {
          classification: "Primary Transit Intersection Breakdown",
          category: "Traffic Congestion",
          confidence: 0.97,
          reasoning: "Central arterial connection linking East Delhi to Connaught Place.",
          severity: "Critical",
          populationAffected: 45000,
          delayImpactScore: 95,
          budgetRequired: 18000,
          timeToRepairHours: 1.5,
          priorityScore: 95,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "DEL-2026-003",
        title: "Dark Alley & Defective Street Lights in Connaught Place Outer Circle",
        description: "Sequence of 8 LED street lamps failed along Outer Circle Block M, creating security concerns for late-night metro commuters.",
        category: "Street Lights",
        status: "Pending",
        latitude: 28.6328,
        longitude: 77.2197,
        address: "Block M, Outer Circle, Connaught Place, New Delhi 110001",
        reportedBy: "Sonia Kapoor",
        reportedAt: "2026-07-23T08:35:00Z",
        images: ["https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:35:00Z",
            comment: "Logged via Delhi Citizen Portal.",
            updatedBy: "Citizen Portal"
          }
        ],
        aiAnalysis: {
          classification: "Public Safety Lighting Outage",
          category: "Street Lights",
          confidence: 0.93,
          reasoning: "Commercial pedestrian corridor darkness increases night safety risk.",
          severity: "Medium",
          populationAffected: 4100,
          delayImpactScore: 25,
          budgetRequired: 12000,
          timeToRepairHours: 3,
          priorityScore: 78,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-DEL-1",
        name: "Amit Verma",
        role: "MCD Environmental Officer",
        department: "Delhi Pollution Control Cell",
        status: "Available",
        currentLat: 28.6469,
        currentLng: 77.3162,
        phone: "+91 98110 22394",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
      },
      {
        id: "FW-DEL-2",
        name: "Pooja Sharma",
        role: "Electrical Grid Inspector",
        department: "NDMC Public Lighting",
        status: "Available",
        currentLat: 28.6328,
        currentLng: 77.2197,
        phone: "+91 98711 00293",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: [
      {
        id: "N-DEL-1",
        role: "Admin",
        title: "AQI Emergency Action Plan Active",
        message: "Anand Vihar smog hazard pre-classified at Priority 98.",
        createdAt: "2026-07-23T06:50:00Z",
        read: false
      }
    ]
  },

  bengaluru: {
    id: "bengaluru",
    cityName: "Bengaluru",
    stateName: "Karnataka",
    centerLat: 12.9716,
    centerLng: 77.5946,
    zoom: 12,
    weather: {
      temp: 24.0,
      condition: "Thundershowers & Sudden Rain",
      rain: 65,
      windSpeed: 18,
      humidity: 84,
      severity: "High"
    },
    budget: {
      allocated: 7800000,
      spent: 3900000,
      remaining: 3900000,
      unassigned: 1100000
    },
    wards: [
      { name: "Mahadevapura Ward (Whitefield)", activeIncidents: 16, slaPerformance: "87%" },
      { name: "Bommanahalli Ward (Silk Board)", activeIncidents: 15, slaPerformance: "84%" },
      { name: "East Ward (Indiranagar)", activeIncidents: 6, slaPerformance: "96%" }
    ],
    aiInsights: [
      "Silk Board junction pothole cluster causing tech corridor transit delays +35 mins.",
      "Bellandur lake storm drain backflow detected by water sensors.",
      "Outer Ring Road IT bus service rerouted smoothly around flooded underpass."
    ],
    complaints: [
      {
        id: "BLR-2026-001",
        title: "Deep Pothole & Crater Cluster on Silk Board Junction Flyover",
        description: "Multiple 1.5-foot deep craters formed on Silk Board Junction ramp toward HSR Layout, causing extreme congestion for IT tech workers.",
        category: "Potholes",
        status: "Pending",
        latitude: 12.9172,
        longitude: 77.6228,
        address: "Silk Board Junction Flyover Ramp, Hosur Road, Bengaluru 560068",
        reportedBy: "Karthik N. (Software Engineer)",
        reportedAt: "2026-07-23T07:30:00Z",
        images: ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: "Silk Board ramp par bohot bade potholes ho gaye hain, car ka bumper toot gaya hai.",
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T07:30:00Z",
            comment: "Logged via Namma Bengaluru App.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Critical Tech Hub Chokepoint",
          category: "Potholes",
          confidence: 0.98,
          reasoning: "Major transit arterial for Electronic City & ORR tech corridors. Rain exacerbates tyre damage.",
          severity: "Critical",
          populationAffected: 28000,
          delayImpactScore: 94,
          budgetRequired: 55000,
          timeToRepairHours: 3.5,
          priorityScore: 97,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "BLR-2026-002",
        title: "Outer Ring Road Underpass Waterlogging at Bellandur",
        description: "Stormwater drain blocked near Ecospace tech park causing 2 feet of standing rain water inside underpass.",
        category: "Waterlogging",
        status: "Pending",
        latitude: 12.9260,
        longitude: 77.6762,
        address: "Bellandur Underpass, Outer Ring Road, Bengaluru 560103",
        reportedBy: "Deepa Swaminathan (Facility Mgr)",
        reportedAt: "2026-07-23T08:15:00Z",
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:15:00Z",
            comment: "Water level sensor alert triggered at 0.6m depth.",
            updatedBy: "IoT Sensor Node"
          }
        ],
        aiAnalysis: {
          classification: "Tech Corridor Flash Flood",
          category: "Waterlogging",
          confidence: 0.96,
          reasoning: "Impassable underpass stalls corporate shuttles and emergency ambulances.",
          severity: "High",
          populationAffected: 19000,
          delayImpactScore: 89,
          budgetRequired: 48000,
          timeToRepairHours: 4,
          priorityScore: 92,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "BLR-2026-003",
        title: "IT Corridor Traffic Signal Freeze at Whitefield Main Road",
        description: "Traffic control box lockup at ITPL main gate intersection sticking red signal for 25 minutes.",
        category: "IT Corridor Traffic",
        status: "Pending",
        latitude: 12.9863,
        longitude: 77.7337,
        address: "ITPL Main Gate Junction, Whitefield, Bengaluru 560066",
        reportedBy: "Commuter Safety Cell",
        reportedAt: "2026-07-23T08:40:00Z",
        images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:40:00Z",
            comment: "Logged by Whitefield Traffic Control.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Signal Timer Logic Lockup",
          category: "IT Corridor Traffic",
          confidence: 0.94,
          reasoning: "High-density commute junction freeze.",
          severity: "Medium",
          populationAffected: 12500,
          delayImpactScore: 70,
          budgetRequired: 14000,
          timeToRepairHours: 2,
          priorityScore: 82,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-BLR-1",
        name: "Manjunath Gowda",
        role: "BBMP Road Infrastructure Specialist",
        department: "BBMP Major Roads Cell",
        status: "Available",
        currentLat: 12.9172,
        currentLng: 77.6228,
        phone: "+91 98450 11203",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
      },
      {
        id: "FW-BLR-2",
        name: "Tejaswini Rao",
        role: "Stormwater Drain Engineer",
        department: "BBMP Storm Water Drains (Mahadevapura)",
        status: "Available",
        currentLat: 12.9260,
        currentLng: 77.6762,
        phone: "+91 98860 99381",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: [
      {
        id: "N-BLR-1",
        role: "Admin",
        title: "Silk Board Flash Incident",
        message: "Silk board pothole crater flagged with Priority 97.",
        createdAt: "2026-07-23T07:35:00Z",
        read: false
      }
    ]
  },

  hyderabad: {
    id: "hyderabad",
    cityName: "Hyderabad",
    stateName: "Telangana",
    centerLat: 17.3850,
    centerLng: 78.4867,
    zoom: 12,
    weather: {
      temp: 31.0,
      condition: "Partly Cloudy",
      rain: 15,
      windSpeed: 12,
      humidity: 62,
      severity: "Low"
    },
    budget: {
      allocated: 7200000,
      spent: 3100000,
      remaining: 4100000,
      unassigned: 950000
    },
    wards: [
      { name: "Serilingampally Ward (Hitech City)", activeIncidents: 9, slaPerformance: "93%" },
      { name: "Khairatabad Ward (Begumpet)", activeIncidents: 6, slaPerformance: "91%" },
      { name: "Charminar Ward (Old City)", activeIncidents: 11, slaPerformance: "85%" }
    ],
    aiInsights: [
      "Hussain Sagar lake drain inflow silt clearing scheduled by GHMC automated excavators.",
      "Hitech City Mindspace flyover asphalt wearing course inspected; minor crack sealed.",
      "Begumpet junction signal optimization reduced peak waiting time by 12%."
    ],
    complaints: [
      {
        id: "HYD-2026-001",
        title: "Asphalt Surface Crack on Hitech City Cyber Towers Flyover",
        description: "Expansion joint gap and asphalt longitudinal crack on Cyber Towers flyover ramp near Mindspace junction.",
        category: "Roads",
        status: "Pending",
        latitude: 17.4504,
        longitude: 78.3808,
        address: "Cyber Towers Flyover, Hitech City, Hyderabad 500081",
        reportedBy: "Srinivas Reddy",
        reportedAt: "2026-07-23T07:10:00Z",
        images: ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T07:10:00Z",
            comment: "Logged via MyGHMC App.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Flyover Structural Expansion Joint Wear",
          category: "Roads",
          confidence: 0.95,
          reasoning: "Heavy commuter traffic across IT hub flyover.",
          severity: "High",
          populationAffected: 15000,
          delayImpactScore: 75,
          budgetRequired: 32000,
          timeToRepairHours: 3,
          priorityScore: 88,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "HYD-2026-002",
        title: "Lake Outlet Drain Silt Blockage at Hussain Sagar",
        description: "Encroached waste and plastic debris choking the surplus water overflow channel near Necklace Road.",
        category: "Lake Encroachments",
        status: "Pending",
        latitude: 17.4239,
        longitude: 78.4738,
        address: "Necklace Road Drain Inlet, Hussain Sagar, Hyderabad 500004",
        reportedBy: "GHMC Lake Protection Squad",
        reportedAt: "2026-07-23T08:05:00Z",
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:05:00Z",
            comment: "Logged during routine GHMC lake inspection.",
            updatedBy: "GHMC Staff"
          }
        ],
        aiAnalysis: {
          classification: "Waterway Choke Hazard",
          category: "Lake Encroachments",
          confidence: 0.94,
          reasoning: "Clearing blockage prevents upstream localized residential flooding.",
          severity: "Medium",
          populationAffected: 8500,
          delayImpactScore: 40,
          budgetRequired: 22000,
          timeToRepairHours: 4,
          priorityScore: 81,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-HYD-1",
        name: "Venkat Rao",
        role: "GHMC Chief Infrastructure Officer",
        department: "GHMC Engineering Wing",
        status: "Available",
        currentLat: 17.4504,
        currentLng: 78.3808,
        phone: "+91 98490 22310",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: []
  },

  chennai: {
    id: "chennai",
    cityName: "Chennai",
    stateName: "Tamil Nadu",
    centerLat: 13.0827,
    centerLng: 80.2707,
    zoom: 12,
    weather: {
      temp: 32.8,
      condition: "Humid & Coastal Breeze",
      rain: 20,
      windSpeed: 22,
      humidity: 82,
      severity: "Low"
    },
    budget: {
      allocated: 6900000,
      spent: 3200000,
      remaining: 3700000,
      unassigned: 800000
    },
    wards: [
      { name: "Zone 9 (T. Nagar)", activeIncidents: 8, slaPerformance: "92%" },
      { name: "Zone 13 (Velachery)", activeIncidents: 12, slaPerformance: "87%" }
    ],
    aiInsights: [
      "Velachery storm drain prep for Northeast monsoon underway.",
      "T. Nagar main water distribution pipeline restored; pressure normal."
    ],
    complaints: [
      {
        id: "CHE-2026-001",
        title: "Velachery Stormwater Drain Grate Blockage",
        description: "Silt accumulation inside storm drain channel along Velachery Main Road near Grand Mall.",
        category: "Drainage",
        status: "Pending",
        latitude: 12.9781,
        longitude: 80.2208,
        address: "Velachery Main Road, Near Grand Mall, Chennai 600042",
        reportedBy: "K. Ramanathan",
        reportedAt: "2026-07-23T07:20:00Z",
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T07:20:00Z",
            comment: "Logged via Greater Chennai Corporation portal.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Pre-Monsoon Drainage Blockage",
          category: "Drainage",
          confidence: 0.95,
          reasoning: "Coastal low-lying flood mitigation priority.",
          severity: "High",
          populationAffected: 11000,
          delayImpactScore: 60,
          budgetRequired: 28000,
          timeToRepairHours: 3,
          priorityScore: 86,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-CHE-1",
        name: "M. Saravanan",
        role: "GCC Stormwater Engineer",
        department: "Greater Chennai Corp Zone 13",
        status: "Available",
        currentLat: 12.9781,
        currentLng: 80.2208,
        phone: "+91 98400 33210",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: []
  },

  pune: {
    id: "pune",
    cityName: "Pune",
    stateName: "Maharashtra",
    centerLat: 18.5204,
    centerLng: 73.8567,
    zoom: 12,
    weather: {
      temp: 26.0,
      condition: "Pleasant Drizzle",
      rain: 30,
      windSpeed: 14,
      humidity: 78,
      severity: "Low"
    },
    budget: {
      allocated: 6400000,
      spent: 2800000,
      remaining: 3600000,
      unassigned: 900000
    },
    wards: [
      { name: "Kothrud Ward", activeIncidents: 5, slaPerformance: "94%" },
      { name: "Viman Nagar Ward", activeIncidents: 7, slaPerformance: "90%" }
    ],
    aiInsights: [
      "Kothrud waste collection compactor route re-optimized for 15% lower fuel consumption.",
      "FC Road pedestrian pavement extension phase 2 completed."
    ],
    complaints: [
      {
        id: "PUN-2026-001",
        title: "Garbage Overflow at Kothrud Garbage Depot Bin",
        description: "Municipal waste bin overflowing onto footpath near Ideal Colony metro station.",
        category: "Garbage",
        status: "Pending",
        latitude: 18.5074,
        longitude: 73.8077,
        address: "Ideal Colony Metro Station Road, Kothrud, Pune 411038",
        reportedBy: "Ganesh Joshi",
        reportedAt: "2026-07-23T07:40:00Z",
        images: ["https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T07:40:00Z",
            comment: "Logged via PMC Care App.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Residential Bin Overflow",
          category: "Garbage",
          confidence: 0.94,
          reasoning: "Routine waste clearance needed.",
          severity: "Medium",
          populationAffected: 3200,
          delayImpactScore: 35,
          budgetRequired: 8000,
          timeToRepairHours: 2,
          priorityScore: 75,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-PUN-1",
        name: "Sachin Kadam",
        role: "PMC Sanitation Supervisor",
        department: "PMC Solid Waste Management",
        status: "Available",
        currentLat: 18.5074,
        currentLng: 73.8077,
        phone: "+91 98220 44102",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: []
  },

  kolkata: {
    id: "kolkata",
    cityName: "Kolkata",
    stateName: "West Bengal",
    centerLat: 22.5726,
    centerLng: 88.3639,
    zoom: 12,
    weather: {
      temp: 30.5,
      condition: "Humid & Overcast",
      rain: 40,
      windSpeed: 16,
      humidity: 86,
      severity: "Medium"
    },
    budget: {
      allocated: 6100000,
      spent: 2900000,
      remaining: 3200000,
      unassigned: 750000
    },
    wards: [
      { name: "Borough IV (College Street)", activeIncidents: 6, slaPerformance: "89%" },
      { name: "Borough VII (Park Street)", activeIncidents: 5, slaPerformance: "93%" }
    ],
    aiInsights: [
      "College Street heritage balcony masonry stabilized; safety barrier erected.",
      "Gariahat tram line track groove cleared of asphalt debris."
    ],
    complaints: [
      {
        id: "KOL-2026-001",
        title: "Heritage Structure Masonry Loose Plaster on College Street",
        description: "Loose cornices and brickwork falling from 100-year old heritage facade onto book stall walkway.",
        category: "Heritage Structure Damage",
        status: "Pending",
        latitude: 22.5744,
        longitude: 88.3638,
        address: "College Street Book Market, Kolkata 700073",
        reportedBy: "Subir Banerjee",
        reportedAt: "2026-07-23T08:15:00Z",
        images: ["https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:15:00Z",
            comment: "Logged via KMC Citizen Portal.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Historic Masonry Hazard",
          category: "Heritage Structure Damage",
          confidence: 0.92,
          reasoning: "Pedestrian hazard in high-density book market.",
          severity: "High",
          populationAffected: 6500,
          delayImpactScore: 50,
          budgetRequired: 35000,
          timeToRepairHours: 4,
          priorityScore: 84,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-KOL-1",
        name: "Debabrata Basu",
        role: "KMC Building Heritage Inspector",
        department: "KMC Building Department",
        status: "Available",
        currentLat: 22.5744,
        currentLng: 88.3638,
        phone: "+91 98300 55120",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: []
  },

  vijayawada: {
    id: "vijayawada",
    cityName: "Vijayawada",
    stateName: "Andhra Pradesh",
    centerLat: 16.5062,
    centerLng: 80.6480,
    zoom: 12,
    weather: {
      temp: 34.2,
      condition: "Warm & Partly Cloudy",
      rain: 10,
      windSpeed: 11,
      humidity: 68,
      severity: "Low"
    },
    budget: {
      allocated: 5800000,
      spent: 2400000,
      remaining: 3400000,
      unassigned: 850000
    },
    wards: [
      { name: "Circle 1 (MG Road)", activeIncidents: 6, slaPerformance: "92%" },
      { name: "Circle 2 (Eluru Canal)", activeIncidents: 8, slaPerformance: "88%" },
      { name: "Circle 3 (Benz Circle)", activeIncidents: 5, slaPerformance: "95%" }
    ],
    aiInsights: [
      "Eluru Canal road spill cleared by VMC municipal health department.",
      "Benz Circle flyover signal timing adjusted to ease peak traffic flow."
    ],
    complaints: [
      {
        id: "VIJ-2026-001",
        title: "Drainage Canal Overflow near Rythu Bazar",
        description: "Eluru canal side drain overflow spilling water onto market approach road near Rythu Bazar, MG Road.",
        category: "Drainage Overflow",
        status: "Pending",
        latitude: 16.5085,
        longitude: 80.6420,
        address: "Near Rythu Bazar, MG Road, Vijayawada, Andhra Pradesh 520010",
        reportedBy: "Nageswara Rao (Trader)",
        reportedAt: "2026-07-23T07:15:00Z",
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: "Rythu Bazar daggara drainage canal water road meedaku vasthundi, kripaya ventane repair cheyandi.",
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T07:15:00Z",
            comment: "Logged via VMC Puraseva App.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Market Approach Drainage Spill",
          category: "Drainage Overflow",
          confidence: 0.96,
          reasoning: "Prevents waterlogging in high footfall agricultural market.",
          severity: "High",
          populationAffected: 8200,
          delayImpactScore: 65,
          budgetRequired: 24000,
          timeToRepairHours: 3,
          priorityScore: 88,
          isDuplicate: false,
          duplicateGroup: null
        }
      },
      {
        id: "VIJ-2026-002",
        title: "Streetlight Cable Exposure near Benz Circle Junction",
        description: "Open electrical junction box on street light pole near Benz Circle flyover pillar 14.",
        category: "Streetlight Repairs",
        status: "Pending",
        latitude: 16.5012,
        longitude: 80.6541,
        address: "Benz Circle Junction, Vijayawada, Andhra Pradesh 520008",
        reportedBy: "K. Venkatesh",
        reportedAt: "2026-07-23T08:00:00Z",
        images: ["https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript: null,
        assignedWorkerId: null,
        completionProof: null,
        history: [
          {
            status: "Pending",
            updatedAt: "2026-07-23T08:00:00Z",
            comment: "Logged by citizen via mobile.",
            updatedBy: "System"
          }
        ],
        aiAnalysis: {
          classification: "Exposed Electrical Junction Box",
          category: "Streetlight Repairs",
          confidence: 0.93,
          reasoning: "Pedestrian electrical hazard.",
          severity: "Medium",
          populationAffected: 4500,
          delayImpactScore: 20,
          budgetRequired: 9000,
          timeToRepairHours: 2,
          priorityScore: 80,
          isDuplicate: false,
          duplicateGroup: null
        }
      }
    ],
    workers: [
      {
        id: "FW-VIJ-1",
        name: "Suresh Babu",
        role: "VMC Municipal Engineer",
        department: "VMC Public Works Circle 1",
        status: "Available",
        currentLat: 16.5085,
        currentLng: 80.6420,
        phone: "+91 98480 11920",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
      }
    ],
    notifications: [
      {
        id: "N-VIJ-1",
        role: "Admin",
        title: "Vijayawada Location Synchronized",
        message: "Loaded 2 active incidents for VMC Circle 1 & 2.",
        createdAt: "2026-07-23T07:20:00Z",
        read: false
      }
    ]
  }
};

// Function to generate the National "All India" aggregate view
export function getNationalAggregateData(): CityData {
  const allCitiesKeys = Object.keys(CITIES_DATA);
  const allComplaints: Complaint[] = [];
  const allWorkers: FieldWorker[] = [];
  const allNotifications: Notification[] = [];
  
  let totalAllocated = 0;
  let totalSpent = 0;
  let totalRemaining = 0;
  let totalUnassigned = 0;

  allCitiesKeys.forEach((key) => {
    const city = CITIES_DATA[key];
    allComplaints.push(...city.complaints);
    allWorkers.push(...city.workers);
    allNotifications.push(...city.notifications);

    totalAllocated += city.budget.allocated;
    totalSpent += city.budget.spent;
    totalRemaining += city.budget.remaining;
    totalUnassigned += city.budget.unassigned;
  });

  return {
    id: "all_india",
    cityName: "All India",
    stateName: "National Overview",
    isNational: true,
    centerLat: 20.5937,
    centerLng: 78.9629,
    zoom: 5,
    weather: {
      temp: 29.0,
      condition: "Varied Regional Weather (Monsoon & Clear)",
      rain: 45,
      windSpeed: 15,
      humidity: 75,
      severity: "Medium"
    },
    budget: {
      allocated: totalAllocated,
      spent: totalSpent,
      remaining: totalRemaining,
      unassigned: totalUnassigned
    },
    wards: [
      { name: "Western Zone (Mumbai & Pune)", activeIncidents: 26, slaPerformance: "92%" },
      { name: "Northern Zone (Delhi NCT)", activeIncidents: 38, slaPerformance: "86%" },
      { name: "Southern Zone (Bengaluru, Hyd, Chennai, Vijayawada)", activeIncidents: 42, slaPerformance: "90%" },
      { name: "Eastern Zone (Kolkata)", activeIncidents: 11, slaPerformance: "89%" }
    ],
    aiInsights: [
      "National Smart City Command Center monitoring 8 major metropolitan clusters.",
      "Monsoon surge active across Mumbai, Bengaluru, and Chennai coastal corridors.",
      "National field worker fleet dispatch efficiency at 91% across all municipal wards."
    ],
    complaints: allComplaints,
    workers: allWorkers,
    notifications: allNotifications
  };
}
