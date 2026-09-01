import { Complaint, FieldWorker, Notification } from "../types";

export const INITIAL_WORKERS: FieldWorker[] = [
  {
    id: "FW-101",
    name: "Rahul Patil",
    role: "Senior Road Infrastructure Engineer",
    department: "BMC Road Infrastructure Cell (K-East Ward)",
    status: "On Mission",
    currentLat: 19.1176,
    currentLng: 72.8561,
    phone: "+91 98201 49182",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-102",
    name: "Sneha Deshmukh",
    role: "Hydrological & Pipeline Specialist",
    department: "BMC Hydraulic Engineer Dept (H-West Ward)",
    status: "Available",
    currentLat: 19.0596,
    currentLng: 72.8397,
    phone: "+91 98192 38102",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-103",
    name: "Ajay Shinde",
    role: "Public Lighting & Electrical Inspector",
    department: "BMC Energy & Public Lighting Dept",
    status: "On Mission",
    currentLat: 19.0178,
    currentLng: 72.8478,
    phone: "+91 98334 10293",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-104",
    name: "Siddharth Mehta",
    role: "Solid Waste Management Supervisor",
    department: "BMC Solid Waste Management (S-Ward Powai)",
    status: "Available",
    currentLat: 19.1197,
    currentLng: 72.9051,
    phone: "+91 98210 77481",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "FW-105",
    name: "Mohammed Shaikh",
    role: "Stormwater Drain & Flood Control Engineer",
    department: "BMC Stormwater Drains Cell (L-Ward Kurla)",
    status: "Offline",
    currentLat: 19.0657,
    currentLng: 72.8794,
    phone: "+91 98920 19382",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "CIQ-2026-001",
    title: "Major Pothole & Road Collapse on Western Express Highway",
    description: "A deep 2-foot pothole has opened up on Western Express Highway near Andheri East metro station. Heavy monsoon rain has washed away the sub-grade asphalt. Commercial buses and two-wheelers are skidding dangerously during peak hours.",
    category: "Potholes & Road Repairs",
    status: "Assigned",
    latitude: 19.1176,
    longitude: 72.8561,
    address: "WEH Junction, Near Magicbricks WeWork, Andheri East, Mumbai, Maharashtra 400069",
    reportedBy: "Priya Kulkarni (Daily Commuter)",
    reportedAt: "2026-07-20T08:30:00Z",
    images: ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: "Namaskar, Western Express Highway par Andheri station ke paas bohot bada gaddha ho gaya hai. Kal raat ki baarish ke baad road ka dhaanv kharab hai aur do-wheeler waalo ke girne ka khatra hai. kripya turant repair bhejein.",
    assignedWorkerId: "FW-101",
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-20T08:30:00Z",
        comment: "Citizen submitted complaint via mobile app with photo and voice message in Hindi.",
        updatedBy: "System"
      },
      {
        status: "Assigned",
        updatedAt: "2026-07-20T08:35:12Z",
        comment: "CivicIQ Agent dispatched Senior Engineer Rahul Patil (BMC Road Infrastructure Cell, 350m away).",
        updatedBy: "CivicIQ Orchestrator"
      }
    ],
    aiAnalysis: {
      classification: "Major Road Damage",
      category: "Potholes & Road Repairs",
      confidence: 0.98,
      reasoning: "Visual analysis identifies structural asphalt sub-base damage on a high-density arterial highway (WEH). monsoon forecast indicates heavy rainfall in 6 hours, elevating flooding and skid hazards.",
      severity: "Critical",
      populationAffected: 14500, // Busy highway commuter lane
      delayImpactScore: 92,
      budgetRequired: 38000, // Rupees ₹38,000
      timeToRepairHours: 4,
      priorityScore: 96,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-002",
    title: "Ruptured Water Pipeline Flooding S.V. Road Sidewalk",
    description: "High pressure water pipe leak on S.V. Road near Bandra West station market. Water is bubbling out rapidly, submerging pedestrian walkways and affecting water supply to nearby residential buildings.",
    category: "Water Leakage & Pipeline Burst",
    status: "Pending",
    latitude: 19.0596,
    longitude: 72.8397,
    address: "Near Bandra Station West, S.V. Road, Bandra West, Mumbai 400050",
    reportedBy: "Akash Jadhav (Local Shopkeeper)",
    reportedAt: "2026-07-21T09:15:00Z",
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: null,
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-21T09:15:00Z",
        comment: "Report logged with photo evidence at Bandra West ward.",
        updatedBy: "System"
      }
    ],
    aiAnalysis: {
      classification: "High Pressure Water Line Burst",
      category: "Water Leakage & Pipeline Burst",
      confidence: 0.94,
      reasoning: "Continuous fluid volume flow submerging pedestrian market footpaths. Pipeline pressure exceeds standard tolerance. Affects clean drinking water supply to H-West Ward residents.",
      severity: "High",
      populationAffected: 6200,
      delayImpactScore: 78,
      budgetRequired: 65000, // ₹65,000
      timeToRepairHours: 6,
      priorityScore: 92,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-003",
    title: "Traffic Signals Out at Dadar TT Circle Intersection",
    description: "All four traffic signals at Dadar TT Circle are completely dark due to short circuit in control box. Major traffic bottleneck near Ambedkar Road connecting South Mumbai to Central suburbs.",
    category: "Traffic Signal Failure",
    status: "In Progress",
    latitude: 19.0178,
    longitude: 72.8478,
    address: "Dadar TT Circle, Dr. Babasaheb Ambedkar Road, Dadar East, Mumbai 400014",
    reportedBy: "Sub-Inspector V. Salunkhe (Mumbai Traffic Police)",
    reportedAt: "2026-07-21T11:00:00Z",
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: "Dadar TT Circle par sabhi traffic lights band hain. Traffic jam ho raha hai, turant BMC electrical team ko bhejein.",
    assignedWorkerId: "FW-103",
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-21T11:00:00Z",
        comment: "Logged by Mumbai Traffic Police Control Room.",
        updatedBy: "Sub-Inspector V. Salunkhe"
      },
      {
        status: "Assigned",
        updatedAt: "2026-07-21T11:05:00Z",
        comment: "Assigned to Ajay Shinde (Public Lighting Inspector).",
        updatedBy: "CivicIQ Orchestrator"
      },
      {
        status: "In Progress",
        updatedAt: "2026-07-21T11:15:00Z",
        comment: "Ajay Shinde arrived at Dadar TT signal junction.",
        updatedBy: "FW-103"
      }
    ],
    aiAnalysis: {
      classification: "Major Junction Signal Outage",
      category: "Traffic Signal Failure",
      confidence: 0.99,
      reasoning: "Major transit node failure at Dadar connecting Eastern and Western lines. Risk of vehicle collision and severe delay for public BEST buses.",
      severity: "Critical",
      populationAffected: 22000,
      delayImpactScore: 95,
      budgetRequired: 15000, // ₹15,000
      timeToRepairHours: 2,
      priorityScore: 95,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-004",
    title: "Open Streetlight Electrical Box near Powai Lake Promenade",
    description: "Cover panel of street lamp post is hanging loose with exposed electric wires near Powai Lake walking path. High risk for evening joggers and children playing nearby.",
    category: "Public Lighting & Exposed Wires",
    status: "Pending",
    latitude: 19.1197,
    longitude: 72.9051,
    address: "Hiranandani Gardens Promenade, Central Avenue, Powai, Mumbai 400076",
    reportedBy: "Ananya Rao (Powai Resident)",
    reportedAt: "2026-07-21T14:20:00Z",
    images: ["https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: null,
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-21T14:20:00Z",
        comment: "Logged via Citizen App with photo attachment.",
        updatedBy: "System"
      }
    ],
    aiAnalysis: {
      classification: "Exposed Wire Hazard",
      category: "Public Lighting & Exposed Wires",
      confidence: 0.91,
      reasoning: "Visible copper live wire terminal exposed near damp soil on Powai Lake jogging track. Immediate safety risk.",
      severity: "High",
      populationAffected: 1200,
      delayImpactScore: 15,
      budgetRequired: 8500, // ₹8,500
      timeToRepairHours: 1.5,
      priorityScore: 84,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-005",
    title: "Garbage Overflow & Waste Accumulation in Kurla Market",
    description: "Large dump of uncollected municipal solid waste blocking alleyway behind Kurla Station West. Causing foul odor and health hazards for nearby fruit vendors and commuters.",
    category: "Garbage & Waste Clearance",
    status: "Resolved",
    latitude: 19.0657,
    longitude: 72.8794,
    address: "LBS Marg, Station Alleyway, Kurla West, Mumbai 400070",
    reportedBy: "Vikram Rane (Market Warden)",
    reportedAt: "2026-07-19T07:10:00Z",
    images: ["https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: "FW-104",
    completionProof: {
      photos: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80"],
      completedAt: "2026-07-19T10:30:00Z",
      comments: "BMC Solid Waste truck cleared 1.8 tons of market garbage. Area sprayed with disinfectant powder."
    },
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-19T07:10:00Z",
        comment: "Market Warden submitted waste overflow report.",
        updatedBy: "Vikram Rane"
      },
      {
        status: "Assigned",
        updatedAt: "2026-07-19T07:15:00Z",
        comment: "Assigned to Siddharth Mehta (BMC SWM Supervisor).",
        updatedBy: "CivicIQ Orchestrator"
      },
      {
        status: "In Progress",
        updatedAt: "2026-07-19T08:00:00Z",
        comment: "BMC Sanitation compactor truck deployed.",
        updatedBy: "FW-104"
      },
      {
        status: "Resolved",
        updatedAt: "2026-07-19T10:30:00Z",
        comment: "Kurla market alley cleared and sanitized.",
        updatedBy: "FW-104"
      }
    ],
    aiAnalysis: {
      classification: "Uncollected Market Solid Waste",
      category: "Garbage & Waste Clearance",
      confidence: 0.96,
      reasoning: "Monsoon humidity accelerates organic waste decay in dense market footfall area. High risk of pest infestation.",
      severity: "High",
      populationAffected: 4500,
      delayImpactScore: 10,
      budgetRequired: 12000, // ₹12,000
      timeToRepairHours: 3,
      priorityScore: 82,
      isDuplicate: false,
      duplicateGroup: null
    }
  },
  {
    id: "CIQ-2026-006",
    title: "Duplicate: Deep Pothole on Western Express Highway",
    description: "Big pothole on WEH near Andheri metro. Vehicle tyres getting damaged. Please repair urgently!",
    category: "Potholes & Road Repairs",
    status: "Pending",
    latitude: 19.1177,
    longitude: 72.8562,
    address: "WEH Flyover, Andheri East, Mumbai 400069",
    reportedBy: "Rohan Sharma (Commuter)",
    reportedAt: "2026-07-20T09:10:00Z",
    images: ["https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
    voiceTranscript: null,
    assignedWorkerId: null,
    completionProof: null,
    history: [
      {
        status: "Pending",
        updatedAt: "2026-07-20T09:10:00Z",
        comment: "Automatically merged as duplicate of primary report CIQ-2026-001 (distance 12m, high spatial & semantic match).",
        updatedBy: "System"
      }
    ],
    aiAnalysis: {
      classification: "Major Road Damage",
      category: "Potholes & Road Repairs",
      confidence: 0.99,
      reasoning: "Distance to active report CIQ-2026-001 is 12m on WEH. Duplicate report auto-merged.",
      severity: "Critical",
      populationAffected: 14500,
      delayImpactScore: 92,
      budgetRequired: 0,
      timeToRepairHours: 0,
      priorityScore: 0,
      isDuplicate: true,
      duplicateGroup: "CIQ-2026-001"
    }
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "N-1",
    role: "Admin",
    title: "High Priority Incident Flagged",
    message: "WEH Andheri pothole (CIQ-2026-001) flagged with Priority Score 96 in K-East Ward.",
    createdAt: "2026-07-20T08:35:00Z",
    read: false,
  },
  {
    id: "N-2",
    role: "Admin",
    title: "Duplicate Complaint Merged",
    message: "Report CIQ-2026-006 merged under primary WEH report CIQ-2026-001.",
    createdAt: "2026-07-20T09:12:00Z",
    read: true,
  },
  {
    id: "N-3",
    role: "Citizen",
    title: "Complaint Received",
    message: "Your water pipeline burst report (CIQ-2026-002) at Bandra West logged by BMC CivicIQ.",
    createdAt: "2026-07-21T09:16:00Z",
    read: false,
  },
  {
    id: "N-4",
    role: "Worker",
    title: "Emergency Dispatch Assigned",
    message: "You have been assigned to 'WEH Andheri Pothole' (CIQ-2026-001). Proceed to location.",
    createdAt: "2026-07-20T08:35:12Z",
    read: false,
  },
];
