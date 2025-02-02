const { client } = require('../client')
const { prefix, home_server } = require('#config').get('prefix', 'home_server')
const { logError } = require('../logger')
const { respond, updateStat } = require('../utils')

module.exports = {
  name: 'clear',
  unlisted: true,
  permissions: ['owner'],
  description: 'leave guilds with no stalkers',
  usage: `Usage: \`${prefix}clear\``,
  examples: {
    valid: [`${prefix}clear`],
  },

  async execute(message) {
    const guilds = global.db.get('guilds').map('id').value()
    const stalkersGuilds = new Set(
      global.db.get('stalkers').map('guildID').value()
    )
    let counter = 0
    for (const id of guilds) {
      if (id === home_server) continue
      if (!stalkersGuilds.has(id)) {
        const guild = await client.guilds.fetch(id).catch(console.error)
        if (!guild) continue
        if (typeof guild.leave === 'function') {
          guild.leave().catch((error) => logError(error, { origin: message }))
          counter++
        }
      }
    }
    updateStat('servers', client.guilds.cache.size)
    respond(message, `Left ${counter} guilds`)
  },
}
