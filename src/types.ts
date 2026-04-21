
export interface Resource {
  type: 'article' | 'video' | 'paid_course' | 'documentation';
  title: string;
  url: string;
  description?: string;
}

export interface Quiz {
  id: string;
  title: string;
  url: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  provider: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'coding' | 'assignment';
  reward: string; // e.g., 'Architect Badge'
  externalUrl?: string;
}

export interface SubTopic {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  isCompleted: boolean;
  estimatedHours: number;
  quizzes?: Quiz[];
  challenges?: Challenge[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  subTopics: SubTopic[];
  dependencies: string[]; // IDs of other RoadmapNodes
  isCompleted: boolean;
}

export interface Roadmap {
  goal: string;
  nodes: RoadmapNode[];
}

export interface StudyTask {
  id: string;
  date: string; // ISO string
  nodeId: string;
  subTopicId: string;
  isCompleted: boolean;
}

export interface UserProgress {
  completedSubTopicIds: string[];
  completedChallengeIds: string[];
  practiceScore: number;
  currentStreak: number;
  lastStudyDate?: string;
  dailyActivity: Record<string, number>; // date string -> count
}
