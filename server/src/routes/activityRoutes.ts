import { Router, Request, Response } from 'express';
import { inferenceEngine } from '../ai/DemoInferenceEngine';
import { simulationService } from '../services/simulationService';
import { ActivityType, HabitatModule } from '../types';

export const activityRouter = Router();

const HAR_ACTIVITY_CATALOG = [
  {
    id: 'WALKING',
    name: 'Walking / Habitat Transit',
    category: 'LOCOMOTION',
    description: 'Bipedal translation across pressurized cabin modules.',
    caloricRate: '180 kcal/hr',
    posture: 'ERECT_DYNAMIC',
  },
  {
    id: 'STANDING',
    name: 'Standing / Station Watch',
    category: 'STATIC',
    description: 'Upright microgravity neutral body posture without active velocity.',
    caloricRate: '95 kcal/hr',
    posture: 'ERECT_STATIC',
  },
  {
    id: 'SITTING',
    name: 'Sitting / Console Operation',
    category: 'SEDENTARY',
    description: 'Restrained seated position at workstation or console interface.',
    caloricRate: '85 kcal/hr',
    posture: 'FLEXED_TRUNK',
  },
  {
    id: 'SLEEPING_RESTING',
    name: 'Sleeping / Rest Cycle',
    category: 'REST',
    description: 'Crew quarters sleep restraint tethered sleep cycle.',
    caloricRate: '60 kcal/hr',
    posture: 'RECUMBENT',
  },
  {
    id: 'EATING',
    name: 'Eating / Nutritional Intake',
    category: 'METABOLIC',
    description: 'Galley meal rehydration and food packet consumption.',
    caloricRate: '100 kcal/hr',
    posture: 'SEATED_DYNAMIC',
  },
  {
    id: 'DRINKING',
    name: 'Drinking / Fluid Hydration',
    category: 'METABOLIC',
    description: 'Hydration pouch consumption via closed valve straw.',
    caloricRate: '90 kcal/hr',
    posture: 'UPPER_LIMB_ELEVATION',
  },
  {
    id: 'EXERCISING',
    name: 'Exercising / Countermeasure Protocol',
    category: 'PHYSICAL_COUNTERMEASURE',
    description: 'ARED resistive gym or T2 cycle ergometer workout.',
    caloricRate: '450 kcal/hr',
    posture: 'HIGH_KINETIC',
  },
  {
    id: 'WORKING',
    name: 'Working / Science Research',
    category: 'MISSION_PAYLOAD',
    description: 'Fine motor glovebox research, biological assays, and specimen handling.',
    caloricRate: '120 kcal/hr',
    posture: 'BENT_FORWARD',
  },
  {
    id: 'OPERATING_EQUIPMENT',
    name: 'Operating Equipment / Station Avionics',
    category: 'AVIONICS',
    description: 'Hardware toggle manipulation, valve operation, and cable routing.',
    caloricRate: '140 kcal/hr',
    posture: 'UPPER_TRUNK_REACH',
  },
  {
    id: 'PICKING_CARRYING',
    name: 'Picking / Carrying Cargo Container',
    category: 'CARGO_TRANSFER',
    description: 'Stowage transfer bag (CTB) retrieval and restraint lockdown.',
    caloricRate: '210 kcal/hr',
    posture: 'FULL_BODY_DYNAMIC',
  },
  {
    id: 'FALL_ABNORMAL_MOVEMENT',
    name: 'Fall / Sudden Abnormal Movement',
    category: 'SAFETY_EVENT',
    description: 'Rapid kinetic acceleration, impact vector, or erratic displacement.',
    caloricRate: '250 kcal/hr',
    posture: 'ERRATIC_TUMBLE',
  },
  {
    id: 'LONG_INACTIVITY',
    name: 'Long Inactivity / Unresponsive Hold',
    category: 'SAFETY_EVENT',
    description: 'Zero translation exceeding duration threshold outside sleep quarters.',
    caloricRate: '65 kcal/hr',
    posture: 'STATIC_FREEZE',
  },
];

activityRouter.get('/', (_req: Request, res: Response) => {
  const metadata = inferenceEngine.getModelMetadata();
  res.json({
    success: true,
    data: {
      activities: HAR_ACTIVITY_CATALOG,
      modelMetadata: metadata,
    },
  });
});

activityRouter.post('/predict', async (req: Request, res: Response) => {
  try {
    const input = req.body || {};
    const prediction = await inferenceEngine.predictActivity(input);
    res.json({ success: true, data: prediction });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

activityRouter.post('/record', async (req: Request, res: Response) => {
  try {
    const { activity, module, confidence } = req.body as {
      activity: ActivityType;
      module?: HabitatModule;
      confidence?: number;
    };

    if (!activity) {
      return res.status(400).json({ success: false, error: 'Activity type is required' });
    }

    const event = await simulationService.recordActivity(activity, module, confidence);
    res.json({ success: true, data: event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
