// src/lib/videoData.ts

export type VideoContent = {
    yoga: string[]; // Array of 2 YouTube Video IDs
    exercise: string[]; // Array of 2 YouTube Video IDs
};

export const VIDEO_ROUTINES: Record<string, Record<number, VideoContent>> = {
    teen: {
        1: { yoga: ['6yF-iZ1g3B4', 'v1A_42vFj4A'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        2: { yoga: ['q5nyrD4dKoU', 'c0B0m6m9v7E'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        3: { yoga: ['-0P0oY3X56Q', 'eH8X43wN9K8'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        4: { yoga: ['s2c6J6F20sI', '6yF-iZ1g3B4'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        5: { yoga: ['v1A_42vFj4A', 'q5nyrD4dKoU'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        6: { yoga: ['c0B0m6m9v7E', '-0P0oY3X56Q'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        7: { yoga: ['eH8X43wN9K8', 's2c6J6F20sI'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
    },
    young: {
        1: { yoga: ['6yF-iZ1g3B4', 'v1A_42vFj4A'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        2: { yoga: ['q5nyrD4dKoU', 'c0B0m6m9v7E'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        3: { yoga: ['-0P0oY3X56Q', 'eH8X43wN9K8'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        4: { yoga: ['s2c6J6F20sI', '6yF-iZ1g3B4'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        5: { yoga: ['v1A_42vFj4A', 'q5nyrD4dKoU'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        6: { yoga: ['c0B0m6m9v7E', '-0P0oY3X56Q'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        7: { yoga: ['eH8X43wN9K8', 's2c6J6F20sI'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
    },
    senior: {
        1: { yoga: ['q5nyrD4dKoU', '6yF-iZ1g3B4'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        2: { yoga: ['v1A_42vFj4A', 'c0B0m6m9v7E'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        3: { yoga: ['-0P0oY3X56Q', 'eH8X43wN9K8'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        4: { yoga: ['s2c6J6F20sI', 'q5nyrD4dKoU'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        5: { yoga: ['6yF-iZ1g3B4', 'v1A_42vFj4A'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
        6: { yoga: ['c0B0m6m9v7E', '-0P0oY3X56Q'], exercise: ['2MoGxae-zyo', 'ml6cT4AZdqI'] },
        7: { yoga: ['eH8X43wN9K8', 's2c6J6F20sI'], exercise: ['8BcPHWGnO44', 'A2wp8S_y7uQ'] },
    }
};
