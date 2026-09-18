import type {Atlas, Concept} from './anatomy';

export type MuscleRole = 'primary' | 'secondary' | 'stabilizer';

export interface ExerciseMuscle {
  label: string;
  role: MuscleRole;
  conceptNames: string[];
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  equipment: string;
  muscleSystem: 'muscular';
  muscles: ExerciseMuscle[];
}

export const BARBELL_SQUAT: ExerciseDefinition = {
  id: 'barbell-squat',
  name: 'Sentadilla con barra',
  equipment: 'Barra',
  muscleSystem: 'muscular',
  muscles: [
    {
      label: 'Glúteo mayor',
      role: 'primary',
      conceptNames: ['gluteus maximus'],
    },
    {
      label: 'Cuádriceps',
      role: 'primary',
      conceptNames: [
        'rectus femoris',
        'vastus lateralis',
        'vastus medialis',
        'vastus intermedius',
      ],
    },
    {
      label: 'Aductores',
      role: 'secondary',
      conceptNames: [
        'adductor magnus',
        'adductor longus',
        'adductor brevis',
        'gracilis',
      ],
    },
    {
      label: 'Isquiotibiales',
      role: 'secondary',
      conceptNames: [
        'biceps femoris',
        'semitendinosus',
        'semimembranosus',
      ],
    },
    {
      label: 'Tríceps sural',
      role: 'secondary',
      conceptNames: ['gastrocnemius', 'soleus'],
    },
    {
      label: 'Extensores del tronco',
      role: 'stabilizer',
      conceptNames: ['erector spinae'],
    },
    {
      label: 'Core anterior',
      role: 'stabilizer',
      conceptNames: ['rectus abdominis', 'external oblique', 'internal oblique'],
    },
  ],
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function findConcepts(concepts: Concept[], wanted: string) {
  const target = normalize(wanted);

  const exact = concepts.filter(concept => normalize(concept.name) === target);
  if (exact.length) return exact;

  // BodyParts3D often stores laterality in separate concepts. Return every
  // matching concept so a generic name such as "gluteus maximus" resolves to
  // both left and right structures instead of arbitrarily choosing one side.
  return concepts
    .filter(concept => normalize(concept.name).includes(target))
    .sort((a, b) => a.name.length - b.name.length);
}

export interface ResolvedExerciseMuscle extends ExerciseMuscle {
  concepts: Concept[];
  elementIds: string[];
  unresolved: string[];
}

export function resolveExerciseMuscles(
  atlas: Atlas,
  exercise: ExerciseDefinition = BARBELL_SQUAT,
): ResolvedExerciseMuscle[] {
  return exercise.muscles.map(muscle => {
    const concepts: Concept[] = [];
    const unresolved: string[] = [];

    for (const name of muscle.conceptNames) {
      const matches = findConcepts(atlas.concepts, name);
      if (matches.length) concepts.push(...matches);
      else unresolved.push(name);
    }

    return {
      ...muscle,
      concepts: [...new Map(concepts.map(concept => [concept.id, concept])).values()],
      elementIds: [...new Set(concepts.flatMap(concept => concept.elements))],
      unresolved,
    };
  });
}

export function allExerciseElementIds(
  atlas: Atlas,
  exercise: ExerciseDefinition = BARBELL_SQUAT,
) {
  return [
    ...new Set(
      resolveExerciseMuscles(atlas, exercise).flatMap(muscle => muscle.elementIds),
    ),
  ];
}
