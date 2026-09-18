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

function findConcept(concepts: Concept[], wanted: string) {
  const target = normalize(wanted);

  const exact = concepts.find(concept => normalize(concept.name) === target);
  if (exact) return exact;

  // BodyParts3D sometimes includes laterality or a more specific anatomical
  // qualifier in the human-readable concept name. Prefer the shortest match so
  // a generic exercise mapping remains stable when the atlas changes.
  return concepts
    .filter(concept => normalize(concept.name).includes(target))
    .sort((a, b) => a.name.length - b.name.length)[0];
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
      const concept = findConcept(atlas.concepts, name);
      if (concept) concepts.push(concept);
      else unresolved.push(name);
    }

    return {
      ...muscle,
      concepts,
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
