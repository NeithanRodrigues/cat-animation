import * as THREE from 'three';

// Animação procedural do esqueleto: conserva a rotação de repouso de cada osso.
// O modelo não contém clips prontos. As três ações abaixo são criadas no código.
export function createCatAnimator(model) {
  const bones = {};
  model.traverse(object => {
    if (object.isBone) bones[object.name] = { node: object, rest: object.quaternion.clone(), position: object.position.clone() };
  });
  const required = ['Tail', 'Tail1', 'Tail2', 'Head', 'Neck', 'Mouth', 'L_Shoulder', 'L_Arm', 'L__FrontPaw', 'R_Shoulder', 'R_Arm', 'L_Thigh', 'R_Thigh', 'L_Leg', 'R_Leg', 'Butt'];
  for (const name of required) if (!bones[name]) throw new Error(`Osso necessário não encontrado: ${name}`);
  let action = 'idle', time = 0, blend = 1;
  let previous = {};
  const offset = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const target = new THREE.Quaternion();
  const root = bones.Butt;
  let fromRoot = root.node.position.clone();
  const smooth = t => t * t * (3 - 2 * t);
  const labels = {idle:'Pose inicial',tail:'Mexendo o rabo',groom:'Lambendo a pata',lie:'Deitado'};

  function play(next) {
    if (!(next in labels)) return;
    // Uma nova ação começa da pose atual: não há saltos nem ações concorrentes.
    previous = Object.fromEntries(Object.entries(bones).map(([name, b]) => [name, b.node.quaternion.clone()]));
    fromRoot.copy(root.node.position);
    action = next; time = 0; blend = 0;
  }
  function update(delta) {
    time += delta;
    blend = Math.min(1, blend + delta / 0.7);
    const w = smooth(blend), pose = {};
    let lower = 0;
    if (action === 'tail') {
      // O eixo Y local move a cauda lateralmente; atraso entre os segmentos produz uma onda.
      ['Tail','Tail1','Tail2'].forEach((name,i) => { pose[name] = [0, Math.sin(time * 3.5 - i * .55) * (.30 + i * .08), 0]; });
    } else if (action === 'groom') {
      const pulse = Math.sin(time * 5);
      pose.L_Shoulder = [0, -.13, 1.35];
      pose.L_Arm = [0, 0, .9];
      pose.L__FrontPaw = [0, 0, -.65];
      pose.Neck = [0, -.16, -.28];
      pose.Head = [0, -.18, -.55 + pulse * .08];
      pose.Mouth = [0, 0, -.09 * (.5 + .5 * pulse)];
      pose.Tail = [0, Math.sin(time * 1.5) * .08, 0];
    } else if (action === 'lie') {
      // Flexão em Z local; os ossos traseiros têm orientações de repouso diferentes.
      pose.L_Shoulder = [0, 0, .738];
      pose.R_Shoulder = [0, 0, .738];
      pose.L_Arm = [0, 0, .808];
      pose.R_Arm = [0, 0, .808];
      pose.L__FrontPaw = [0, 0, -1.546];
      pose.R_FrontPaw = [0, 0, -1.546];
      pose.L_Thigh = [0, 0, -1.016];
      pose.R_Thigh = [0, 0, -1.016];
      pose.L_Leg = [0, 0, 1.525];
      pose.R_Leg = [0, 0, 1.525];
      pose.L_BackPaw = [0, 0, -.509];
      pose.R_BackPaw = [0, 0, -.509];
      pose.Neck = [0, 0, -.16];
      pose.Head = [0, 0, .14];
      pose.Tail = [0, .4, -.75];
      lower = -.123 + Math.sin(time * 1.8) * .0015;
    }
    for (const [name, bone] of Object.entries(bones)) {
      const p = pose[name] || [0,0,0];
      offset.setFromEuler(euler.set(...p));
      target.copy(bone.rest).multiply(offset);
      bone.node.quaternion.copy(previous[name] || bone.rest).slerp(target, w);
    }
    root.node.position.copy(fromRoot).lerp(root.position.clone().add(new THREE.Vector3(0, lower, 0)), w);
    model.updateMatrixWorld(true);
  }
  return { play, update, labels, get action() { return action; } };
}
