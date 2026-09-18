export interface SquatPose {
  depth: number;
  shinAngle: number;
  thighAngle: number;
  torsoAngle: number;
  kneeY: number;
  kneeZ: number;
  hipY: number;
  hipZ: number;
}

const ANKLE_Y = 0.10;
const KNEE_Y = 0.52;
const HIP_Y = 0.92;
const SHIN_LENGTH = KNEE_Y - ANKLE_Y;
const THIGH_LENGTH = HIP_Y - KNEE_Y;
const radians = (degrees: number) => degrees * Math.PI / 180;

export function getSquatPose(progress: number): SquatPose {
  const phase = Math.max(0, Math.min(1, progress));
  // One complete repetition: standing -> bottom -> standing.
  const depth = Math.sin(Math.PI * phase);
  const shinAngle = radians(20) * depth;
  const thighAngle = radians(65) * depth;
  const torsoAngle = radians(28) * depth;

  const kneeY = ANKLE_Y + Math.cos(shinAngle) * SHIN_LENGTH;
  const kneeZ = Math.sin(shinAngle) * SHIN_LENGTH;
  const hipY = kneeY + Math.cos(thighAngle) * THIGH_LENGTH;
  const hipZ = kneeZ - Math.sin(thighAngle) * THIGH_LENGTH;

  return {depth, shinAngle, thighAngle, torsoAngle, kneeY, kneeZ, hipY, hipZ};
}

export const SQUAT_VERTEX_GLSL = `
vec3 formaRotateX(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

vec3 formaSquat(vec3 p, float progress) {
  float depth = sin(3.14159265359 * clamp(progress, 0.0, 1.0));
  float shinAngle = radians(20.0) * depth;
  float thighAngle = radians(65.0) * depth;
  float torsoAngle = radians(28.0) * depth;

  const float ankleY = 0.10;
  const float kneeY = 0.52;
  const float hipY = 0.92;
  const float shinLength = 0.42;
  const float thighLength = 0.40;

  vec3 ankle = vec3(0.0, ankleY, 0.0);
  vec3 knee0 = vec3(0.0, kneeY, 0.0);
  vec3 hip0 = vec3(0.0, hipY, 0.0);

  vec3 knee1 = ankle + vec3(
    0.0,
    cos(shinAngle) * shinLength,
    sin(shinAngle) * shinLength
  );

  vec3 hip1 = knee1 + vec3(
    0.0,
    cos(thighAngle) * thighLength,
    -sin(thighAngle) * thighLength
  );

  vec3 footPose = p;
  vec3 shinPose = ankle + formaRotateX(p - ankle, shinAngle);
  vec3 thighPose = knee1 + formaRotateX(p - knee0, -thighAngle);
  vec3 torsoPose = hip1 + formaRotateX(p - hip0, torsoAngle);

  // Blend around joints so muscles, connective tissue and body surface remain
  // visually continuous while we prototype the rig on the real atlas geometry.
  float ankleBlend = smoothstep(0.07, 0.15, p.y);
  float kneeBlend = smoothstep(0.47, 0.57, p.y);
  float hipBlend = smoothstep(0.86, 0.98, p.y);

  vec3 lowerLeg = mix(footPose, shinPose, ankleBlend);
  vec3 leg = mix(lowerLeg, thighPose, kneeBlend);
  return mix(leg, torsoPose, hipBlend);
}

vec3 formaSquatNormal(vec3 n, float originalY, float progress) {
  float depth = sin(3.14159265359 * clamp(progress, 0.0, 1.0));
  float shinAngle = radians(20.0) * depth;
  float thighAngle = radians(65.0) * depth;
  float torsoAngle = radians(28.0) * depth;

  float shinWeight = 1.0 - smoothstep(0.47, 0.57, originalY);
  float torsoWeight = smoothstep(0.86, 0.98, originalY);
  float thighWeight = 1.0 - shinWeight - torsoWeight;
  float angle = shinAngle * shinWeight - thighAngle * thighWeight + torsoAngle * torsoWeight;
  return normalize(formaRotateX(n, angle));
}
`;
