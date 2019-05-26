var fakecard = $('<div class="fakecard">')

$.fn.insertAt = function(index, element) {
	var lastIndex = this.children().length;
	if (index < 0) {
		index = Math.max(0, lastIndex + 1 + index);
	}
	this.append(element);
	if (index < lastIndex) {
		this.children().eq(index).before(this.children().last());
	}
	return this;
}

function moveCard(card, e) {
	card.css('left', e.pageX - card.outerWidth()/2)
	card.css('top', e.pageY - card.outerHeight()/2)
}

function initFakeCard() {
	fakecard.detach()
	$('.cardHolder').first().append(fakecard)
}

function manageFakeCards(card, e) {
	var cards = $('.card')
	var titles = $('.columnTitle')
	var minDist = null
	var closestEntity = null
	var cardPosition = getPosition(card[0])
	var lambda = (ind, c) => {
		var pos = getPosition(c)
		var dist = getDistance(cardPosition, pos)
		if(minDist == null || minDist > dist) {
			minDist = dist
			closestEntity = c
		}
	}
	cards.each(lambda)
	titles.each(lambda)
	var wrapped = $(closestEntity)
	var parent = wrapped.parent()
	var pos = getPosition(closestEntity)
	if(wrapped.hasClass('columnTitle')) {
		if(parent.find('.fakecard').length == 0) {
			fakecard.detach()
			parent.find('.cardHolder').append(fakecard)
		}
	} else {
		var above = isAbove(cardPosition, pos)
		if(parent.find('.fakecard').length == 0 ||
		(above && fakecard.index() != wrapped.index()) ||
		(!above && fakecard.index() != wrapped.index()+1)) {
			fakecard.detach()
			parent.insertAt(above ? wrapped.index() : wrapped.index()+1, fakecard)
		}
	}
}

function getPosition(el) {
	const {top, left, width, height} = el.getBoundingClientRect()
	return {
		x: left + width / 2,
		y: top + height / 2
	}
}

function getDistance(a, b) {
	return Math.hypot(a.x - b.x, a.y - b.y);  
}

function isAbove(a, b) {
	return a.y <= b.y;
}

function cloneCard(text, e) {
	initFakeCard()
	var newCard = $('<div class="draggedcard">')
	newCard.text(text)
	$('body').addClass('dragging')
	var main = $('body')
	main.append(newCard)
	moveCard(newCard, e)
	$(document).mousemove((e)=>{
		moveCard(newCard, e)
		manageFakeCards(newCard, e)
	})
	$(document).mouseup((e)=>{
		addCard(fakecard.parent(), newCard.text(), fakecard.index())
		newCard.remove()
		$(document).off('mousemove')
		$(document).off('mouseup')
		$('body').removeClass('dragging')
		$('.fakecard').remove()
	})
}

function addCard(holder, text, pos) {
	var newCard = $('<div class="card">')
	newCard.text(text)
	newCard.mousedown((e)=>{
		cloneCard(text, e)
		newCard.remove()
	})
	holder.insertAt(pos, newCard)
}

var CARD_ADDER = '<div class="addCardHolder adder button"> <div class="addСardEditor editor inactive"> <input type="text" class="newNameInput" placeholder="Введите название карточки" /> <div class="addRow button"> <span class="addButton">Добавить карточку</span> <img src="resources/cross.svg" class="closeEditor"></img> </div> </div> <div class="startEditingButton button"> <img src="resources/plus.svg" id="plusSign"></img> <span class="addText">Добавить еще одну карточку</span> </div> </div>'

function addColumn(text) {
	let root = $('<div class="column">')
	let title = $('<div class="columnTitle">')
	title.text(text)
	let cards = $('<div class="cardHolder">')
	let adder = $(CARD_ADDER)
	
	let addButton = adder.find('.addButton').first()
	let newNameInput = adder.find('.newNameInput').first()
	let closeEditorButton = adder.find('.closeEditor').first()
	let startEditingElement = adder.find('.startEditingButton').first()
	let cardEditor = adder.find('.editor').first()
	
	startEditingElement.on('click', ()=>{
		startEditingElement.addClass('inactive')
		cardEditor.removeClass('inactive')
	})
	closeEditorButton.on('click', ()=>{
		cardEditor.addClass('inactive')
		startEditingElement.removeClass('inactive')
		newNameInput.val('')
	})
	addButton.on('click', ()=>{
		let text = newNameInput.val().trim()
		if(text.length > 0) {
			cardEditor.addClass('inactive')
			startEditingElement.removeClass('inactive')
			newNameInput.val('')
			addCard(cards, text, -1)
		}
	})
	
	root.append(title, cards, adder)

	let columns = $('.column')
	if(columns.length > 0) {
		$('.column').last().after(root)
	} else {
		$('#main').prepend(root)
	}
}

window.onload = function() {
	let columnAdder = $('#addColumnHolder')
	let columnEditor = $(".editor").first()
	let addButton = $(".addButton").first()
	let newNameInput = $('.newNameInput').first()
	let startEditingElement = $(".startEditingButton").first()
	let closeEditorButton = $(".closeEditor").first()
	startEditingElement.on('click', ()=>{
		startEditingElement.addClass('inactive')
		columnEditor.removeClass('inactive')
	})
	closeEditorButton.on('click', ()=>{
		columnEditor.addClass('inactive')
		startEditingElement.removeClass('inactive')
		newNameInput.val('')
	})
	addButton.on('click', ()=>{
		let text = newNameInput.val().trim()
		if(text.length > 0) {
			columnEditor.addClass('inactive')
			startEditingElement.removeClass('inactive')
			newNameInput.val('')
			addColumn(text)
		}
	})
}