// src/lib/videoData.ts

export type VideoContent = {
    yoga: string[]; // Array of 2 YouTube Video IDs
    exercise: string[]; // Array of 2 YouTube Video IDs
};

export const VIDEO_ROUTINES: Record<string, Record<number, VideoContent>> = {
    teen: {
        1: { yoga: ['id1', 'id2'], exercise: ['id3', 'id4'] },
        2: { yoga: ['id5', 'id6'], exercise: ['id7', 'id8'] },
        3: { yoga: ['id9', 'id10'], exercise: ['id11', 'id12'] },
        4: { yoga: ['id13', 'id14'], exercise: ['id15', 'id16'] },
        5: { yoga: ['id17', 'id18'], exercise: ['id19', 'id20'] },
        6: { yoga: ['id21', 'id22'], exercise: ['id23', 'id24'] },
        7: { yoga: ['id25', 'id26'], exercise: ['id27', 'id28'] },
    },
    young: {
        1: { yoga: ['idA', 'idB'], exercise: ['idC', 'idD'] },
        2: { yoga: ['idE', 'idF'], exercise: ['idG', 'idH'] },
        3: { yoga: ['idI', 'idJ'], exercise: ['idK', 'idL'] },
        4: { yoga: ['idM', 'idN'], exercise: ['idO', 'idP'] },
        5: { yoga: ['idQ', 'idR'], exercise: ['idS', 'idT'] },
        6: { yoga: ['idU', 'idV'], exercise: ['idW', 'idX'] },
        7: { yoga: ['idY', 'idZ'], exercise: ['id1A', 'id1B'] },
    },
    senior: {
        1: { yoga: ['idX', 'idY'], exercise: ['idZ', 'idW'] },
        2: { yoga: ['idS1', 'idS2'], exercise: ['idS3', 'idS4'] },
        3: { yoga: ['idS5', 'idS6'], exercise: ['idS7', 'idS8'] },
        4: { yoga: ['idS9', 'idS10'], exercise: ['idS11', 'idS12'] },
        5: { yoga: ['idS13', 'idS14'], exercise: ['idS15', 'idS16'] },
        6: { yoga: ['idS17', 'idS18'], exercise: ['idS19', 'idS20'] },
        7: { yoga: ['idS21', 'idS22'], exercise: ['idS23', 'idS24'] },
    }
};
