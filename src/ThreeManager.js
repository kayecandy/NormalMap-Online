import {
  ClampToEdgeWrapping,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneBufferGeometry,
  RGBAFormat,
  Scene,
  Texture,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import {
  EffectComposer,
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {
  HorizontalBlurShader,
} from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import {
  VerticalBlurShader,
} from 'three/examples/jsm/shaders/VerticalBlurShader.js';

import { config } from './config.js';
import { NormalMapShader } from './shader/NormalMapShader.js';

export class ThreeManager {
  /**
   * @private
   */
  static _instance;

  /**
   * @type {HTMLCanvasElement}
   */
  canvas;
  /**
   * @type {WebGLRenderer}
   */
  renderer;
  /**
   * @type {WebGLRenderTarget}
   */
  rendererTarget;
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
  /**
   * @type {Texture}
   */
  texture;
  /**
   * @type {PlaneBufferGeometry}
   */
  geometry;
  /**
   * @type {Mesh}
   */
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
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    this.canvas = this.renderer.domElement;

    this.renderer.setClearColor(0x000000, 0);
    this.rendererTarget = new WebGLRenderTarget(0, 0, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
      stencilBuffer: false,
    });
    this.renderer.setRenderTarget(this.rendererTarget);

    this.camera = new OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, 0, 1);

    this.scene = new Scene();

    this.material = new NormalMapShader();
    // this.material = new MeshBasicMaterial({color: 'red'});
    this.material.transparent = true;
    this.texture = new Texture();
    this.texture.wrapS = this.texture.wrapT = ClampToEdgeWrapping;
    this.texture.minFilter = this.texture.magFilter = NearestFilter;
    this.texture.anisotropy = 2;

    this.mesh = new Mesh(new PlaneBufferGeometry(1, 1, 1, 1), this.material);

    this.scene.add(this.mesh);
  }

  __initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    this.hBlurEffect = new ShaderPass(HorizontalBlurShader);
    this.vBlurEffect = new ShaderPass(VerticalBlurShader);

    this.hBlurEffect.renderToScreen = true;
    this.vBlurEffect.renderToScreen = true;

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
   *
   * @param {HTMLCanvasElement | HTMLImageElement} image
   */
  imageToBlackAndWhite(image) {
    /**
     * Convert to black and white
     */

    /**
     * @type {HTMLCanvasElement}
     */
    let cImage = image;

    if (typeof image !== HTMLCanvasElement) {
      cImage = document.createElement("canvas");
      cImage.width = image.width;
      cImage.height = image.height;
      cImage.getContext("2d").drawImage(image, 0, 0);
    }

    const ctxImage = cImage.getContext("2d");
    const imgData = ctxImage.getImageData(0, 0, image.width, image.height, {
      colorSpace: "srgb",
    });

    for (let i = 0; i < imgData.data.length; i += 4) {
      let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
      let colour = 0;
      if (count < 100) colour = 255;

      imgData.data[i] = colour;
      imgData.data[i + 1] = colour;
      imgData.data[i + 2] = colour;
      imgData.data[i + 3] = 255;
    }

    ctxImage.putImageData(imgData, 0, 0);
  }

  /**
   * @param {HTMLImageElement | HTMLCanvasElement} image
   * @param {typeof config} params
   */
  renderNormalImage(image, params) {
    this.renderer.setSize(image.width, image.height);
    this.composer.setSize(image.width, image.height);
    this.rendererTarget.setSize(image.width, image.height);

    this.texture.image = image;

    this.material.uniforms.tHeightMap.value = this.texture;

    this.hBlurEffect.uniforms.h.value = this.calculateBlurH(params.blur, image);

    this.vBlurEffect.uniforms.v.value = this.calculateBlurV(params.blur, image);


    this.texture.needsUpdate = true;
    this.material.uniformsNeedUpdate = true;
    this.material.needsUpdate = true;



    this.composer.render();


    /**
     * 2nd Render
     */

    const blurredImage = document.createElement("canvas");
    const blurredImageCtx = blurredImage.getContext("2d");

    blurredImage.width = this.canvas.width;
    blurredImage.height = this.canvas.height;

    blurredImageCtx.fillStyle = "white";
    blurredImageCtx.fillRect(0, 0, blurredImage.width, blurredImage.height);
    blurredImageCtx.drawImage(this.canvas, 0, 0);

    this.imageToBlackAndWhite(blurredImage);

    this.texture.image = blurredImage;

    this.hBlurEffect.uniforms.h.value = 0;
    this.vBlurEffect.uniforms.v.value = 0;

    this.material.uniforms.tHeightMap.value = this.texture;
    this.material.uniforms.dimensions.value = [image.width, image.height, 0];
    this.material.uniforms.dz.value = this.calculateDz(
      params.strength,
      params.level
    );
    this.material.uniforms.invertG.value = params.invertG;
    this.material.uniforms.invertR.value = params.invertR;
    this.material.uniforms.invertH.value = params.invertH;
    this.material.uniforms.type.value = params.type;

    this.texture.needsUpdate = true;
    this.material.uniformsNeedUpdate = true;
    this.material.needsUpdate = true;

    this.composer.render();

    return this.canvas;
  }
}
