var card = Vue.component('card', {
	props: {
		current: {
			type: Boolean,
			required: true },

		fullName: {
			type: String,
			required: true },

		picture: {
			type: String,
			required: false },

		rating: {
			type: Number,
			required: true },

		approved: {
			type: Boolean } },


	template: '\n\t\t<div v-if="showing" class="card"\n\t\t\tv-bind:class="{ animated: animating, current: current }"\n\t\t\tv-bind:style="{ transform: returnTransformString }">\n\t\t\t<div class="image"\n\t\t\t\tv-bind:style="{ backgroundImage: returnImageString }">\n\t\t\t\t<div class="image-icon"\n\t\t\t\t\tv-bind:class="icon.type"\n\t\t\t\t\tv-bind:style="{ opacity: icon.opacity }">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<h1 class="name">{{ fullName }}</h1>\n\t\t\t<div class="stars">\n\t\t\t\t<div v-for="(star, index) in maxStars"\n\t\t\t\t\tv-bind:class="[(rating > index) ? \'star-active\' : \'star-inactive\']">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t',


















	data: function data() {
		return {
			showing: true,
			maxStars: 5,
			animating: true, // Controls CSS class with transition
								// declaration
			threshold: window.innerWidth / 3, // Breakpoint distance to
												// approve/reject a card
			maxRotation: 20, // Max rotation value in degrees
			position: {
				x: 0,
				y: 0,
				rotation: 0 },

			icon: {
				opacity: 0,
				type: null } };


	},
	computed: {
		returnImageString: function returnImageString() {

			return 'url(' + this.picture + ')';

		},
		returnTransformString: function returnTransformString() {

			if (this.animating === false || this.approved !== null) {
				var x = this.position.x;
				var y = this.position.y;
				var rotate = this.position.rotation;
				return 'translate3D(' + x + 'px, ' + y + 'px, 0) rotate(' + rotate + 'deg)';
			} else
			{
				return null;
			}

		} },

	mounted: function mounted() {

		var element = this.$el;
		var self = this;

		interact(element).draggable({
			inertia: false,
			onstart: function onstart() {

				/*
				 * Disable CSS transitions during dragging.
				 */

				self.animating = false;

			},
			onmove: function onmove(event) {

				/*
				 * Calculate new x and y coordinate values from the local value
				 * and the event object value. Also adjust element rotation
				 * transformation based on proximity to approve/reject
				 * threshold.
				 */

				var x = (self.position.x || 0) + event.dx;
				var y = (self.position.y || 0) + event.dy;

				var rotate = self.maxRotation * (x / self.threshold);

				if (rotate > self.maxRotation) {
					rotate = self.maxRotation;
				} else
				if (rotate < -self.maxRotation) {
					rotate = -self.maxRotation;
				}

				self.position.x = x;
				self.position.y = y;
				self.position.rotation = rotate;

				/*
				 * Change icon image type based on drag direction and adjust
				 * opacity from 0-1 based on current rotation amount. Also emit
				 * an event to show/hide respective button below cards during
				 * dragging.
				 */

				if (rotate > 0) {
					self.icon.type = 'approve';
				} else
				if (rotate < 0) {
					self.icon.type = 'reject';
				}

				var opacityAmount = Math.abs(rotate) / self.maxRotation;

				self.icon.opacity = opacityAmount;
				self.$emit('draggedActive', self.icon.type, opacityAmount);

			},
			onend: function onend(event) {

				/*
				 * Check if card has passed the approve/reject threshold and
				 * emit approval value change event, otherwise reset card and
				 * icon to default values.
				 */

				self.animating = true;

				if (self.position.x > self.threshold) {
					self.$emit('draggedThreshold', true);
					self.icon.opacity = 1;
				} else
				if (self.position.x < -self.threshold) {
					self.$emit('draggedThreshold', false);
					self.icon.opacity = 1;
				} else
				{
					self.position.x = 0;
					self.position.y = 0;
					self.position.rotation = 0;
					self.icon.opacity = 0;
				}

				self.$emit('draggedEnded');

			} });



	},
	watch: {
		approved: function approved() {

			if (this.approved !== null) {

				var self = this;

				// Remove interact listener to prevent further dragging
				interact(this.$el).unset();
				this.animating = true;

				/*
				 * Move card off-screen in direction of approve/reject status,
				 * then remove it from the DOM, thereby adjusting the CSS
				 * nth-child selectors.
				 */

				var x = window.innerWidth + window.innerWidth / 2 + this.$el.offsetWidth;

				if (this.approved === true) {
					this.position.x = x;
					this.position.rotation = this.maxRotation;
					this.icon.type = 'approve';
				} else
				if (this.approved === false) {
					this.position.x = -x;
					this.position.rotation = -this.maxRotation;
					this.icon.type = 'reject';
				}

				this.icon.opacity = 1;

				setTimeout(function () {
					self.showing = false;
				}, 200);

			}

		} } });



var app = new Vue({
	el: '#app',
	template: '\n\t\t<div id="app">\n\n\t\t\t<div v-show="isLoading" class="loading">\n\t\t\t\t<div class="loading-icon"></div>\n\t\t\t</div>\n\n\t\t\t<div class="card-container">\n\t\t\t\t<card v-for="(card, index) in cards.data" :key="index"\n\t\t\t\t\tv-bind:current="index === cards.index"\n\t\t\t\t\tv-bind:fullName="card.name"\n\t\t\t\t\tv-bind:picture="card.picture"\n\t\t\t\t\tv-bind:rating="card.rating"\n\t\t\t\t\tv-bind:approved="card.approved"\n\t\t\t\t\tv-on:draggedThreshold="setApproval">\n\t\t\t\t</card>\n\t\t\t</div>\n\n\t\t</div>\n\t',


















	data: {
		isLoading: true, // Toggles the loading overlay
		cards: {
			data: null, // Array for card data
			index: 0, // Current index in the cards.data array
			max: 10 // Max cards to show in each stack
		} },

	methods: {
		getData: function getData() {

			this.isLoading = true;
			this.cards.data = null;
			var self = this;

			// Get a random list of people
			var request = new XMLHttpRequest();
			request.open('GET', 'https://randomuser.me/api/?results=' + this.cards.max, true);

			request.onload = function () {

				var response = JSON.parse(request.responseText).results;

				var data = response.map(function (object) {

					/*
					 * Construct a new array with objects containing only the
					 * relevent data from the original response data
					 */

					return {
						name: object.name.first + ' ' + object.name.last,
						picture: object.picture.large,
						rating: Math.floor(Math.random() * 5 + 1),
						approved: null };


				});

				// Fake delay for purposes of demonstration
				setTimeout(function () {
					self.cards.data = data;
					self.cards.index = 0;
					self.isLoading = false;
				}, 500);

			};

			request.send();

		},
		setApproval: function setApproval(approval) {

			/*
			 * Change approval value for current card, and request new data if
			 * at the end of the card array
			 */

			this.cards.data[this.cards.index].approved = approval;
			this.cards.index++;

			if (this.cards.index >= this.cards.data.length) {
				this.getData();
			}

		} },


	mounted: function mounted() {

		this.getData();

	} });