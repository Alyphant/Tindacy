var nextStack 		= 1;

var scheu 			= false;
var abhanegig 		= false;
var eitel 			= false;
var asozial 		= false;
var undiszipliniert = false;
var eingebildet 	= false;
var heimtueckisch 	= false;
var zynisch 		= false;
var gierig 			= false;
var manipulativ 	= false;
var streitsuechtig 	= false;
var chaotisch 		= false;
var egoistisch 		= false;
var chaotisch		= false;
var ruecksichtslos 	= false;

function setzeEigenschaftAufTrue(nameString){
	switch(nameString){
	case "scheu":
		scheu = true;
		break;
	case "abhanegig":
		abhanegig = true;
		break;
	case "eitel":
		eitel = true;
		break;
	case "asozial":
		asozial = true;
		break;
	case "undiszipliniert":
		undiszipliniert = true;
		break;
	case "eingebildet":
		eingebildet = true;
		break;
	case "heimtueckisch":
		heimtueckisch = true;
		break;
	case "zynisch":
		zynisch = true;
		break;
	case "gierig":
		gierig = true;
		break;
	case "manipulativ":
		manipulativ = true;
		break;
	case "streitsuechtig":
		streitsuechtig = true;
		break;
	case "chaotisch":
		chaotisch = true;
		break;
	case "egoistisch":
		egoistisch = true;
		break;
	case "chaotisch":
		chaotisch = true;
		break;
	case "ruecksichtslos":
		ruecksichtslos = true;
		break;
	default:
		break;
	}
}

var card = Vue.component('card', {
	props: {
		cardID: {
			type: Number
		},
		current: {
			type: Boolean,
			required: true 
			},

		fullName: {
			type: String,
			required: true 
			},
			
		content: {
			type: String,
			required: true 
			},					

		picture: {
			type: String,
			required: false 
			},

		approved: {
			type: Boolean 
		}, 
		
		nextCardLeft: {
			type: Number,
			required: false
		},
			
		nextCardRight: {
			type: Number,
			required: false
		},
		triggerLeft: {
			type: String,
			required: false
		},
		triggerRight: {
			type: String,
			required: false
		}
	},
			



	template: 
		'\n\t\t'
		+'<div v-if="showing" class="card" v-bind:class="{ animated: animating, current: current }" v-bind:style="{ transform: returnTransformString }">'
			+'\n\t\t\t'
			+'<div class="image" v-bind:style="{ backgroundImage: returnImageString }">'
				+'\n\t\t\t\t'
				+'<div class="image-icon" v-bind:class="icon.type" v-bind:style="{ opacity: icon.opacity }">'
					+'\n\t\t\t\t'
				+'</div>'
				+'\n\t\t\t'
			+'</div>'
			+'\n\t\t\t'
			+'<h1 class="name">'
				+'{{ fullName }}'
			+'</h1>'
			+'<div class="content">'
				+'{{ content }}'
			+'</div>'
		+'</div>',


	data: function data() {
		return {
			showing: true,
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

			return 'url(pics/' +this.picture+ ')'

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
					if(self.nextCardRight >= 0){
						nextStack = self.nextCardRight;
					}
					setzeEigenschaftAufTrue(self.triggerRight);
				} else
				if (rotate < 0) {
					self.icon.type = 'reject';
					if(self.nextCardLeft >= 0){
						nextStack = self.nextCardLeft;
					}
					setzeEigenschaftAufTrue(self.triggerLeft);
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
	template: 
		'\n\t\t'
		+'<div id="app">'
			+'\n\n\t\t\t'
			+'<div v-show="isLoading" class="loading">'
				+'\n\t\t\t\t'
				+'<div class="loading-icon">'
				+'</div>'
				+'\n\t\t\t'
			+'</div>'
			+'<div class="card-container">'
				+'\n\t\t\t\t'
				+'<card v-for="(card, index) in cards.data" :key="index"' 
						+'v-bind:current="index === cards.index"'
						+'v-bind:content="card.content"' 
						+'v-bind:nextCardLeft="card.nextCardLeft"' 
						+'v-bind:nextCardRight="card.nextCardRight"'
						+'v-bind:triggerRight="card.triggerRight"' 
						+'v-bind:triggerLeft="card.triggerLeft"' 
						+'v-bind:cardID="card.cardID" v-bind:fullName="card.name"' 
						+'v-bind:picture="card.picture"'
						+'v-bind:approved="card.approved"'
						+'v-on:draggedThreshold="setApproval">'
				+'</card>'
				+'\n\t\t\t'
			+'</div>'
			+'\n\n\t\t'
		+'</div>'
		+'\n\t',
	
	data: {
		isLoading: true, // Toggles the loading overlay
		cards: {
			data: null, // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		} },

	methods: {
		getData: function getData() {

			this.isLoading = true;
			this.cards.data = null;
			var self = this;

//			// Get a random list of people
			var request = new XMLHttpRequest();
			request.open('GET', 'https://randomuser.me/api/?results=' + this.cards.max, true);

			request.onload = function () {

				var response = JSON.parse(request.responseText).results;
switch(nextStack){
case 1:
	var data = cardstacks.begruessung.data;
	break;
case 2:
	var data = cardstacks.einarbeitung.data;
	break;
case 3:
	var data = cardstacks.campusleben.data;
	break;
case 4:
	var data = cardstacks.networking.data;
	break;
case 5:
	var data = cardstacks.aergerMitAsta.data;
	break;
case 6:
	var data = cardstacks.fakultaetsRatsSitzung.data;
	break;
case 7:
	var data = cardstacks.begruessungDerErstis.data;
	break;
case 8:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
case 9:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
case 10:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
case 11:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
case 12:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
case 13:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
case 14:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
case 15:
	window.open("http://5c16c86bbb7a1.prepaiddomain.de/social/social.html","_self");
	break;
}



				
//				var i = 0;
//				var data = response.map(function (object) {
//
//					/*
//					 * Construct a new array with objects containing only the
//					 * relevent data from the original response data
//					 */
//					i++;
//					return {
//						name: object.name.first + ' ' + object.name.last,
//						content: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren.',
//						picture: object.picture.large,
//						approved: null, 
//						nextCardLeft: i-1,
//						nextCardRight: i+1,
//						cardID: i
//					};
//
//				});

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

var cardstacks = {
		begruessung: {
			data: [
				{
					cardID: 1,
					name: "Sekretärin Saskia",
					content: "*Am Telefon* Entschuldigung, uns ist ein kleiner Fehler unterlaufen, wir haben vergessen einzutragen welches Geschlecht sie haben, das ist für unsere Abrechnung wichtig. #Bist du ein Mann?#",					
					picture: "frauMeier3.jpg",	
					approved: null
					},
				{
					cardID: 2,
					name: "Sekretärin Saskia",
					content: "Wir haben hier keine Anzugspflicht, dir steht es frei im Jogginganzug zu erscheinen *lacht* #Willst du einen Anzug tragen?# ",					
					picture: "frauMeier4.jpg",
					approved: null,
					triggerLeft: "eitel",
					triggerRight: "asozial"
					},
				{
					cardID: 3,
					name: "Der Hausmeister",
					content: "Hallo, du musst der Neue sein. Bin grad auf dem Weg zum Automaten um Kaffee zu holen. Möchtest du mit Milch oder ohne? #Trinkst du Milch in deinem Kaffee?#",					
					picture: "hausmeister1.jpg",
					approved: null, 					
					nextCardLeft: 2,					
					nextCardRight: 3,
					triggerLeft: "scheu",
					triggerRight: "abhaengig"
					},
				{
					cardID: 4,
					name: "Daniel Duesentrieb",
					content: "Wir haben aktuell wahnsinig tolle neue Moeglichkeiten in der KI entwickelt. Es waere atemberaubend wenn Sie uns ermoeglichen koennten einen Kurs testweise von einer KI leiten zu lassen. #Lässt du die KI zu?#",					
					picture: "danielDuesentrieb.jpg",	
					approved: null
					},
			], // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		},
		einarbeitung: {
			data: [
				{
					cardID: 1,
					name: "Sekretärin Saskia",
					content: "Wir haben hier noch einige Seiten an Dienstvorschriften die Sie lesen muessten. *packt Stapel auf den Tisch* Die meisten überfliegen sie zwar nru, aber besser waere es schon wenn Sie die gruendlich studieren wuerden. #Liest du die Dienstvorschriften aufmerksam?#",					
					picture: "frauMeier5.jpg",	
					approved: null,
					nextCardLeft: 5,					
					nextCardRight: 4,
					triggerRight: "undiszipliniert"
					},
				{
					cardID: 2,
					name: "Der Hausmeister",
					content: "Wir brauchen merh Gelder um die Flure neu zu streichen. Ich mein ein Jahr koennte man vielleicht noch warten aber mir waere schon lieber wenn wir das jetzt demnaechst noch erledigen. #Genehmigst du Geld für Renovierungen?#",					
					picture: "hausmeister2.jpg",
					approved: null
					},
			], // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		},
		campusleben: {
			data: [
				{
					cardID: 1,
					name: "Gunda Gantel",
					content: "Hallo mein Name ist Gunda und ich komme als Vertreterin der philosophischen Fakultät. Ihr Vorgaenger hatte uns zugesichert, dass wir einen neuen eigenen Fachbereich bekommen. #Führst du die neue Fakultät ein?#",					
					picture: "gundula2.jpg",	
					approved: null
				},
				{
					cardID: 2,
					name: "Der Hausmeister",
					content: "Diese Spinner wollen doch jetzt tatsächlich überall Unisex-Toiletten. Wissen Sie was das bedeutet? Ich muesste auf dem gesamten Campus alle Schilder abmachen, neue herstellen lassen und diese auch noch aufhängen. Warum wollen diese Hippies überhaupt gemeinsam auf Klo? Ich mein ich will beim scheißen einfach nur meine Ruhe. #Bist du für Unisex Toiletten?#",					
					picture: "hausmeister3.jpg",
					approved: null
				},
				{
					cardID: 3,
					name: "Sekretärin Saskia",
					content: "Wow, ich muss ja sagen, dass ich den neuen Park den sie genehmigt haben wirklich beeindruckend finde. Das wird die gesamte Universität aufwerten. Eine Frage wäre da allerdings noch zu klären, damit ich das Gelände auch endlich ordnungsgemäß in unser System eintragen kann. Welchen Namen soll der neue Park tragen? *lacht* Ihren vielleicht? Oder den des Universitätsbegründers? #Soll der Park ihren Namen tragen?#",					
					picture: "frauMeier6.jpg",	
					approved: null,
					triggerRight: "eingebildet"
				},
				{
					cardID: 4,
					name: "Hans Hinterhalt",
					content: "Was? So wollen Sie den Park nennen? Ich weiß wir geraten öfter aneinander aber bei so einer Namensgebung da MUSS ich einfach widersprechen. #Wollen sie den Störenfried einfach rausschmeißen?#",					
					picture: "hinterhaeltigerTyp.jpg",	
					approved: null,
					nextCardLeft: 7,					
					nextCardRight: 6,
					triggerRight: "heimtueckisch"
				},
				{
					cardID: 5,
					name: "Der Hausmeister",
					content: "Hi Chef, ich habe mir überlegt wie wir den Park noch weiter verbessern können. Es gäbe da eine tolle Stelle um eine Fliederlaube zu bauen...einziges Problem, da sind Parkplätze für Blinde. Aber ich mein welcher Blinde fährt denn schon Auto? #Glaubst du Blinde brauchen keine extra Parkplätze?#",					
					picture: "hausmeister4.jpg",	
					approved: null,
					triggerRight: "zynisch"
				},
			], // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		},
		networking: {
			data: [
				{
					cardID: 1,
					name: "Geldsack Mc Gold",
					content: "Hallo, lange nicht gesehen. Ich war grad in der Stadt und wollte kurz auf einen Kaffee reinschauen. Du hast doch letztes mal erzählt, dass du gerne Golf spielst und als ich mir gestern ein neues Set geholt habe, da hab ich diesen Schläger gesehen und gedacht, dass das genau der richtige sein muss für dich. #Willst du den Schläger gleich ausprobieren?#",					
					picture: "geldsack.jpg",	
					approved: null,
					triggerRight: "gierig"
					},
				{
					cardID: 2,
					name: "Geldsack Mc Gold",
					content: "*lacht* Nun gut, eine Kleinigkeit hätte ich aber noch. Ihr habt einen guten Ruf was BWL Absolventen an geht und ich dachte es wäre vielleicht im Interesse der Universität dort noch ein wenig Wirtschaftsnähe rein zu bringen. Ich würde vorschlagen, dass wir eines eurer Module unterrichten können. Dafür würde ich extra einen unserer besten Experten abbeordern. #Möchtest du die Studenten wirtschaftlich fördern?#",					
					picture: "geldsack2.jpg",
					approved: null,
					triggerRight: "manipulativ"
					},
				{
					cardID: 3,
					name: "Sekretärin Saskia",
					content: "Ich möchte Sie in ihren ersten Tagen ja ungern unter druck setzen, aber die Internationale Wirtschaftsanalysten Messe, die wir jedes Jahr ausrichten muss langsam geplant werden für das kommende Jahr. Sie wissen ja selbst, dass die Messe einen Großteil unseres Haushalts finanziert. #Möchtest du die Veranstaltung weiterlaufen lassen?#",					
					picture: "frauMeier1.jpg",
					approved: null, 					
					nextCardLeft: 8,					
					nextCardRight: 9
					},
			], // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		},
		aergerMitAsta: {
			data: [
				{
					cardID: 1,
					name: "Guenter Gras",
					content: "Hallo erst mal, ich bin ja nicht so der Typ der gerne Streitet aber irgendwie haben sie in ihrer letzter Sitzung echt voll die Gefühle von Minderheiten verletzt und das ist so garnicht cool. Ich mein StudentX ist doch nicht zu viel verlangt. Bei liebe Student/innen fühlen sich ja doch auch viele LEute total ausgeschlossen. Ich will da auch garkeinen Ärger machen oder so aber gut ist das nicht. #Schenkst du dem Anliegen Beachtung?#",					
					picture: "guenter6.jpg",	
					approved: null,
					nextCardLeft: 10,					
					nextCardRight: 11,
					triggerLeft: "streitsuechtig"
					},
				{
					cardID: 2,
					name: "Guenter Gras",
					content: "Oh, einen Punkt hätte ich doch fast vergessen. Wir treffen uns ja hier regelmäßig zum Plenum mit einigen StudentX und die Preise für Vegane Bio Fairtrade Küche sind enorm gestiegen im letzten Jahr. Wir bräuchten vielleicht ein wenig mehr Geld, damit wir weiterhin auch auf faire Lebensmittel bei unseren Veranstaltungen setzen können. #Genehmigst du Geld für Lebensmittel?#",					
					picture: "guenter5.jpg",
					approved: null
					},
				{
					cardID: 3,
					name: "Der Hausmeister",
					content: "Oh man dieser Typ schon wieder. Kam der aus Ihrem Büro? Naja wie dem auch sei, die planen wohl dieses Jahr tatsächlich, dass wir von unserem knappen Budget noch irgendwas an die 3.Welt spenden sollen. Wovon sollen wir dann aber hier die Gebäude in schuss halten und Streusalz für die Wege kaufen? Ideen haben diese Jungs. Sollen die doch selber spenden. #Stellst du Haushaltsgelder für Spenden bereit?#",					
					picture: "hausmeister5.jpg",
					approved: null
					},
			], // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		},
		fakultaetsRatsSitzung: {
			data: [
				{
					cardID: 1,
					name: "Du im Spiegel",
					content: "Boah voll verplant, dass gleich diese Sitzung ist. Hätte gestern nicht so lange machen dürfen. Was mach ich nur? Entweder ich geh einfach so wie ich bin oder ich komme ein paar Minuten später aber habe noch Zeit mich eben ein wenig frisch zu machen. #Beeilst du dich um rechtzeitig zu erscheinen?#",					
					picture: "duImSpiegel.jpg",	
					approved: null,
					triggerRight: "chaotisch"
					},
				{
					cardID: 2,
					name: "Guenter Gras",
					content: "Hallooo? Alter hast du mitbekommen, dass die Informatiker sich ein neues Edulab finanzieren lassen wollen? Wir haben doch funktionierende Computer, wofür brauchen die schon wieder neue? Unser Kunstraum ist doch viel wichtiger, der soll schon seit Jahren vergrößert werden. #Genehmigst du Gelder für das Edulab?#",					
					picture: "guenter4.jpg",
					approved: null,
					nextCardLeft: 12,					
					nextCardRight: 13
					},
				{
					cardID: 3,
					name: "Sekretärin Saskia",
					content: "Entschuldigung, ich habe eben ein wenig zuhören müssen und auch wenn es mich nichts angeht, so muss ich sagen ich finde Ihre Entscheidung nciht richtig. Als Leiter einer Universität muss man auch mal entgegen seiner eigenen Vorzüge entscheiden und sich zum Wohle der Universität einsetzen. #Änderst du deine Meinung doch noch?#",					
					picture: "frauMeier2.jpg",
					approved: null,
					triggerLeft: "streitsuechtig",
					triggerRight: "aengstlich"
				},
				{
					cardID: 3,
					name: "Sportstudentin Schantall",
					content: "Was ist das für 1 scheis mit biotohp? Besser 1 nicen place für squats *macht 1 nicen squat* #Willst du das Biotop trotzdem durchsetzen?#",					
					picture: "schantallSport.jpg",
					approved: null,
					triggerLeft: "egoistisch",
					triggerRight: ""
				},
			], // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		},
		begruessungDerErstis: {
			data: [
				{
					cardID: 1,
					name: "Sportstudentin Schantall",
					content: "Hi prof, willst du dich nicht zu mir auf die couch setzen? #Setzt du dich zu ihr auf DIE Couch?#",					
					picture: "schantallCouch.jpg",	
					approved: null,
					nextCardLeft: 14,					
					nextCardRight: 15,
					triggerRight: "eindringlich"
					},
				{
					cardID: 2,
					name: "Guenter Gras",
					content: "Hallooo Director, wir fänden das irgendwie voll cool wenn du uns helfen könntest ein paar Spiele zu organisieren für die Erstsemester. Irgendwie bekommen wir das mit der Planung nicht so richtig hin. #Traust du dir zu die Erstiwoche noch neben deiner normalen Tätigkeit zu realisieren?#",					
					picture: "guenter3.jpg",
					approved: null,
					triggerLeft: "chaotisch"
					},
				{
					cardID: 3,
					name: "Gunda Gantel",
					content: "Erstsemesterwoche hin oder her. Herr Direktor, es geht nicht, dass die Studenten immer bis spät in die Nacht noch auf dem Campus sind. Die Kollegen und ich sind für einen Zapfenstreich um 20Uhr. #Setzt du den Zapfenstreich an?#",					
					picture: "gundula1.jpg",
					approved: null,
					triggerRight: "ruecksichtslos"
				},
			], // Array for card data
			index: 0, // Current index in the cards.data array
			max: 20, // Max cards to show in each stack
			next: 0
		},
};