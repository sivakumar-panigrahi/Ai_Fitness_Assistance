// src/lib/videoData.ts

export type VideoContent = {
    yoga: string[]; // Array of 2 YouTube Video IDs
    exercise: string[]; // Array of 2 YouTube Video IDs
};

export const VIDEO_ROUTINES: Record<string, Record<number, VideoContent>> = {
    teen: {
        1: { yoga: ['6yF-iZ1g3B4', 'c0B0m6m9v7E'], exercise: ['37DOnX_O8I4', 'L_xp77J_vXw'] },
        2: { yoga: ['v1A_42vFj4A', 'jFqXkK9T0v0'], exercise: ['ml6cT4AZdqI', 'uHOnHAbHAt8'] },
        3: { yoga: ['O0L_Xlq9774', '-0P0oY3X56Q'], exercise: ['2MoGxae-zyo', 'vMqm3M6x-1U'] },
        4: { yoga: ['_6340n0w8_I', 'eH8X43wN9K8'], exercise: ['gC_L9qAHVJ8', '8BcPHWGnO44'] },
        5: { yoga: ['s2c6J6F20sI', '6yF-iZ1g3B4'], exercise: ['37DOnX_O8I4', 'L_xp77J_vXw'] },
        6: { yoga: ['v1A_42vFj4A', 'jFqXkK9T0v0'], exercise: ['ml6cT4AZdqI', 'uHOnHAbHAt8'] },
        7: { yoga: ['O0L_Xlq9774', '-0P0oY3X56Q'], exercise: ['2MoGxae-zyo', 'vMqm3M6x-1U'] },
    },
    young: {
        1: { yoga: ['6yF-iZ1g3B4', 'v1A_42vFj4A'], exercise: ['ml6cT4AZdqI', 'vMqm3M6x-1U'] },
        2: { yoga: ['c0B0m6m9v7E', 'jFqXkK9T0v0'], exercise: ['2MoGxae-zyo', '37DOnX_O8I4'] },
        3: { yoga: ['-0P0oY3X56Q', '_6340n0w8_I'], exercise: ['uHOnHAbHAt8', 'L_xp77J_vXw'] },
        4: { yoga: ['eH8X43wN9K8', 's2c6J6F20sI'], exercise: ['gC_L9qAHVJ8', '8BcPHWGnO44'] },
        5: { yoga: ['O0L_Xlq9774', '6yF-iZ1g3B4'], exercise: ['ml6cT4AZdqI', 'vMqm3M6x-1U'] },
        6: { yoga: ['v1A_42vFj4A', 'c0B0m6m9v7E'], exercise: ['2MoGxae-zyo', '37DOnX_O8I4'] },
        7: { yoga: ['jFqXkK9T0v0', '-0P0oY3X56Q'], exercise: ['uHOnHAbHAt8', 'L_xp77J_vXw'] },
    },
    senior: {
        1: { yoga: ['b1H3xO3x_Js', 'v1A_42vFj4A'], exercise: ['gC_L9qAHVJ8', 'A2wp8S_y7uQ'] },
        2: { yoga: ['_6340n0w8_I', 's2c6J6F20sI'], exercise: ['8BcPHWGnO44', '2MoGxae-zyo'] },
        3: { yoga: ['-0P0oY3X56Q', 'O0L_Xlq9774'], exercise: ['ml6cT4AZdqI', 'uHOnHAbHAt8'] },
        4: { yoga: ['6yF-iZ1g3B4', 'c0B0m6m9v7E'], exercise: ['37DOnX_O8I4', 'L_xp77J_vXw'] },
        5: { yoga: ['b1H3xO3x_Js', 'v1A_42vFj4A'], exercise: ['gC_L9qAHVJ8', 'A2wp8S_y7uQ'] },
        6: { yoga: ['_6340n0w8_I', 's2c6J6F20sI'], exercise: ['8BcPHWGnO44', '2MoGxae-zyo'] },
        7: { yoga: ['-0P0oY3X56Q', 'O0L_Xlq9774'], exercise: ['ml6cT4AZdqI', 'uHOnHAbHAt8'] },
    }
};
