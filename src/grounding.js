import { Vector3 } from 'three';
// Usa os vértices deformados pelo esqueleto para manter contato com o piso.
// O grupo do gato está diretamente na cena (sem transformação em um pai).
export function createGrounding(model, clearance = .006) {
  const meshes = [];
  const vertex = new Vector3();
  model.traverse(o => { if (o.isMesh) meshes.push(o); });
  return () => {
    model.updateMatrixWorld(true);
    let minY = Infinity;
    for (const mesh of meshes) {
      mesh.skeleton?.update();
      for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
        mesh.getVertexPosition(i, vertex).applyMatrix4(mesh.matrixWorld);
        minY = Math.min(minY, vertex.y);
      }
    }
    if (Number.isFinite(minY)) model.position.y += clearance - minY;
    model.updateMatrixWorld(true);
  };
}
