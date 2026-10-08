// Only the parts of three.js the coin uses, exposed the way medallion.js expects them.
import { ACESFilmicToneMapping, CanvasTexture, DirectionalLight, ExtrudeGeometry, Group, HemisphereLight, LatheGeometry, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PMREMGenerator, PerspectiveCamera, PlaneGeometry, PointLight, RepeatWrapping, Scene, Vector2, WebGLRenderer, sRGBEncoding } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
window.THREE = { ACESFilmicToneMapping, CanvasTexture, DirectionalLight, ExtrudeGeometry, Group, HemisphereLight, LatheGeometry, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PMREMGenerator, PerspectiveCamera, PlaneGeometry, PointLight, RepeatWrapping, Scene, Vector2, WebGLRenderer, sRGBEncoding, SVGLoader, RoomEnvironment };
