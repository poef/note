import "simplyview"
import "simplyflow"
import "@muze-nl/metro"
import theds from "@muze-nl/theds"

const demo = simply.app({
	routes: {
		'#demo/:param': function(params) {

		}
	},
	commands: {
		demo: async function(el, value) {
			await this.actions.demo()
		}
	},
	actions: {
		demo: async function() {
			this.state.demo = await this.api.demo()
		}
	},
	state: simply.state.signal({}),
	hooks: {
		start: async function() {
			simply.bind({
				root: this.state
			})
		}
	},
	api: metro.jsonApi(
		window.location.href,
		{
			demo: function() {
				return this.get('demo.json')
			}
		}
	),
	components: {
		theds
	}
})

export default demo
globalThis.demo = demo