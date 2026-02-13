/** @type {import('houdini').ConfigFile} */
const config = {
  watchSchema: {
    url: process.env.HOUDINI_SCHEMA_URL || 'http://localhost:3000/graphql',
  },
  plugins: {
    'houdini-svelte': {},
  },
  scalars: {},
};

export default config;
