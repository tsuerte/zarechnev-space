import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '7framccn',
    dataset: 'production'
  },
  studioHost: 'zarechnev-space-studio',
  deployment: {
    appId: 'vpyb2dd4kzxj0ezcwl1i33h1',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
