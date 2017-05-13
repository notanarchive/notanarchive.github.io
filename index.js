const _       = require('lodash')
const Promise = require('bluebird')
const lj      = require('livejournal')
const fs      = require('fs')

main()

async function main() {
	let beforedate = null
	let allEvents = []
	let events = []

	do {
		events = await getEvents(beforedate)
		allEvents = allEvents.concat(events)

		let lastEvent = _.last(events)

		if (lastEvent) {
			beforedate = lastEvent.eventtime
		}
	} while (events.length)

	fs.writeFile('data.json', JSON.stringify(allEvents, null, '\t'), (err, res) => {
		if (err) {
			throw err
		}

		console.log('Done!')
	})
}

async function getEvents(beforedate) {
	return new Promise((resolve, reject) => {
		let config = {
			journal: 'grrm',
			auth_method: 'noauth',
			selecttype: 'lastn',
			howmany: 50
		}

		if (beforedate) {
			config.beforedate = beforedate
		}

		console.log('Getting events before ' + (beforedate || 'now'))

		lj.xmlrpc.getevents(config, async function(err, value) {
			console.log('Got ' + value.events.length + ' events!')

			let promises = _(value.events).chain()
				.filter(e => e.reply_count > 0)
				.map(attachComments)
				.value()

			await Promise.all(promises)
			resolve(value.events)
		})
	})
}

async function attachComments(post) {
	console.log('Attaching comments for ' + post.ditemid)

	return new Promise((resolve, reject) => {
		lj.jsonrpc.request('comment.get_thread', {
			journal: 'grrm',
			itemid: post.ditemid + ''
		}, function(err, res) {
			// console.log(post.ditemid)
			if (err) {
				throw err
			}
			// console.log(res.body)
			post.comments = res.body.result.comments
			resolve()
		})
	})
}