import { Mesh, OrthographicCamera, PlaneBufferGeometry, Scene, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";
import { config } from "./config.js";
import { NormalMapShader } from "./shader/NormalMapShader.js";


export class ThreeManager {

  static _instance;

  canvas;
  /**
   * @type {WebGLRenderer}
   */
  renderer;
  camera;
  /**
   * @type {Scene}
   */
  scene;
  /**
   * @type {NormalMapShader}
   */
  /**
   * @type {EffectComposer}
   */
	composer;
	/**
	 * @type {NormalMapShader}
	 */
  material;
  mesh;

  /**
   * @type {ShaderPass & HorizontalBlurShader}
   */
  hBlurEffect;
  /**
   * @type {ShaderPass & VerticalBlurShader}
   */
  vBlurEffect;

  constructor() {
    this.__initThree();

    this.__initPostProcessing();
  }

  /**
   * @static
   * @function
   * @returns {ThreeManager} instance
   */
  static instance() {
    if (!ThreeManager._instance) {
      ThreeManager._instance = new ThreeManager();
    }

    return ThreeManager._instance;
  }

  __initThree() {
    this.canvas = document.createElement("canvas");

    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: canvas,
    });

    renderer.setClearColor(0x000000, 0);

    this.camera = new OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, 0, 1);

    this.scene = new Scene();

    this.material = new NormalMapShader();
    this.material.transparent = true;

    this.mesh = new Mesh(new PlaneBufferGeometry(1, 1, 1, 1), this.material);

    this.scene.add(this.mesh);
  }

  __initPostProcessing() {
    this.composer = new EffectComposer(this.renderer, this.canvas);

    this.hBlurEffect = new ShaderPass(HorizontalBlurShader);
    this.vBlurEffect = new ShaderPass(VerticalBlurShader);

    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(this.hBlurEffect);
    this.composer.addPass(this.vBlurEffect);
  }

  calculateDz(strength, level) {
    return (1 / strength) * (1 + Math.pow(2, level));
  }

	/**
	 * 
	 * @param {number} h 
	 * @param {HTMLImageElement} image 
	 */
	calculateBlurH(h, image) {
		return h / image.width / 5;
	}

	/**
	 * 
	 * @param {number} v
	 * @param {HTMLImageElement} image 
	 */
	 calculateBlurV(v, image) {
		return v / image.height / 5;
	}

  /**
   * @param {HTMLImageElement} image
   * @param {typeof config} params
   */
  renderNormalImage(image, params) {
    this.renderer.setSize(image.width, image.height);
    this.composer.setSize(image.width, image.height);


		this.material.uniforms = {
			...this.material.uniforms,
			tHeightMap: image,
      dimensions: [image.width, image.height, 0],
			dz: this.calculateDz(params.strength, params.level),
			invertG: params.invertG,
			invertR: params.invertR,
			invertH: params.invertH
		}
		
		this.material.uniformsNeedUpdate = true;

		this.hBlurEffect.uniforms.h = this.calculateBlurH(params.blur, image);
		this.vBlurEffect.uniforms.v = this.calculateBlurV(params.blur, image);


		this.composer.render();

		return this.canvas;
  }
}
