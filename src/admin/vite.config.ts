import { mergeConfig, type UserConfig } from 'vite';

let editorPatched = false;

export default (config: UserConfig) => mergeConfig(config, {
  plugins: [{
    name: 'capitar-isolate-content-type-editor',
    enforce: 'pre',
    transform(source, id) {
      if (!id.replace(/\\/g, '/').endsWith('/@strapi/content-manager/dist/admin/pages/EditView/EditViewPage.mjs')) return;
      // Strapi 5.52.3 reuses the editor across model changes. Descendant fields
      // can observe the new route with the previous model's form/layout state.
      // Remount only on model changes; save, publish and status tabs keep state.
      const target = 'jsx(EditViewPage, {})';
      if (!source.includes(target)) throw new Error('Review the Capitar editor isolation patch after upgrading Strapi.');
      editorPatched = true;
      return { code: source.replace(target, 'jsx(EditViewPage, {}, slug)'), map: null };
    },
    generateBundle() {
      if (!editorPatched) this.error('The Capitar editor isolation patch was not applied; review the Strapi module path.');
    },
  }],
});
