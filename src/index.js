// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading. 

window.addEventListener('DOMContentLoaded', () => {

    const list = document.getElementById('quote-list')
    const form = document.getElementById('new-quote-form')
    const BASEURL = 'http://localhost:3000'
    const QUOTESURL = `${BASEURL}/quotes?_embed=likes`
    const LIKESURL = `${BASEURL}/likes`
    const DELETEOBJ = {method: 'DELETE', headers: {"Content-Type": "application/json", "Accept": "application/json"}}
    form.addEventListener('submit', createNewQuote)

    function createAPIObj(type, obj) {
        headerObj = {method: type, headers: {"Content-Type": "application/json", "Accept": "application/json"}, body: JSON.stringify(obj)}
        return headerObj
    }

    function getQuotes() {
        return fetch(QUOTESURL)
        .then(resp => resp.json())
        .then(json => renderQuotes(json))
    }

    function renderQuotes(quotesArray) {
        quotesArray.forEach(quote => displayQuote(quote))
    }

    function displayQuote(quote) {
        const div = document.createElement('div')
        div.id = `div${quote.id}`
        div.className = 'quote-div'

        list.append(createDivContent(div, quote))
    }

    function createDivContent(div, quote) {
        const p = document.createElement('p')
        p.id = `quote${quote.id}`
        createPContent(p, quote); createLikeButton(p, quote); createEditButton(p, quote); createDeleteButton(p, quote)
        div.append(p)
        return div
    }

    function createPContent(p, quote) {
        const strong = document.createElement('strong')
        strong.innerText = `${quote.author}   `
        p.innerText = `${quote.quote} -`
        p.append(strong)
        return p
    }

    function createLikeButton(p, quote) {
        const likeButton = document.createElement('button')
        if (quote.likes) {
            likeButton.innerText = `⭐️ ${quote.likes.length}`
        } else {
            likeButton.innerText = `⭐️ 0` 
        }
        likeButton.className = 'likeBtn'
        likeButton.addEventListener('click', () => likeQuote(quote))
        p.append(likeButton)
    }

    function createEditButton(p, quote) {
        const editButton = document.createElement('button')
        p.append(editButton)
        editButton.addEventListener('click', () => editQuote(quote))
        editButton.innerText = 'Edit'
    }

    function createDeleteButton(p, quote) {
        const deleteButton = document.createElement('button')
        p.append(deleteButton)
        deleteButton.className = 'deleteBtn'
        deleteButton.innerText = "x"
        deleteButton.addEventListener('click', () => deleteQuote(quote))
        const br = document.createElement('br')
        p.append(br)
    }

    function createNewQuote(e) {
        e.preventDefault()
        quote = {
            quote: e.target[0].value,
            author: e.target[1].value
        }
        addQuote(quote)
        e.target.reset()
    }

    function addQuote(quote) {
        object = createAPIObj('POST', quote)
        return fetch(QUOTESURL, object)
        .then(resp => resp.json())
        .then(json => displayQuote(json))
    }   

    function likeQuote(quote) {
        const like = {
            quoteId: quote.id,
            createdAt: Math.floor(Date.now()/1000)
        }
        object = createAPIObj('POST', like)
        return fetch(LIKESURL, object)
        .then(resp => resp.json())
        .then(() => updateLikeButton(quote))
    }
        
        function updateLikeButton(quote) {
            return fetch(`${BASEURL}/quotes/${quote.id}?_embed=likes`)
            .then(resp => resp.json())
            .then(updatedQuote => {
            const p = document.getElementById(`quote${updatedQuote.id}`)
            p.querySelector('.likeBtn').innerText = `⭐️ ${updatedQuote.likes.length}`
            })
        }

    function editQuote(quote) {
        const editQuoteForm = document.querySelector(`#edit-quote${quote.id}-form`)
        if (editQuoteForm) {
            editQuoteForm.parentNode.removeChild(editQuoteForm)
        } else {
            createForm(quote)
        }      
    }

    function createForm(quote) {
        quoteDiv = document.querySelector(`#div${quote.id}`)
            const editForm = document.createElement('form')
            editForm.id = `edit-quote${quote.id}-form`
            editForm.className = 'edit-quote-form'
            editForm.dataset.id = quote.id
            quoteDiv.append(editForm)
            
            createQuoteInput(editForm, quote)
            createAuthorInput(editForm, quote)
            createEditSubmitButton(editForm)
            editForm.addEventListener('submit', updateForm)
    }

    function createQuoteInput(editForm, quote) {
        const formGroupDiv = document.createElement('div')
        formGroupDiv.className = 'edit-form-group'
        editForm.append(formGroupDiv)

        const formControlInput = document.createElement('input')
        formControlInput.className = 'edit-form'
        formControlInput.type = "text"
        formControlInput.value = quote.quote
        formGroupDiv.append(formControlInput)
    }

    function createAuthorInput(editForm, quote) {
        const formGroupDiv2 = document.createElement('div')
        formGroupDiv2.className = 'form-group'
        editForm.append(formGroupDiv2)

        const formControlInput2 = document.createElement('input')
        formControlInput2.className = 'form-control'
        formControlInput2.type = "text"
        formControlInput2.value = quote.author
        formGroupDiv2.append(formControlInput2)
    }

    function createEditSubmitButton(editForm) {
        const editButton = document.createElement('button')
        editButton.type = 'submit'
        editButton.className = "btn btn-primary"
        editButton.innerText = "Update Quote"
        editForm.append(editButton)
    }

    function updateForm(e) {
        e.preventDefault()
        const quote = { 
            quote: e.target[0].value,
            author: e.target[1].value
        }
        const object = createAPIObj('PATCH', quote)
            return fetch(`${BASEURL}/quotes/${e.target.dataset.id}`, object)
            .then(resp => resp.json())
            .then(() => fetch(`${BASEURL}/quotes/${e.target.dataset.id}?_embed=likes`))
            .then(resp => resp.json())
            .then (json => replaceQuote(json))
        }

    function replaceQuote(quote) {
        const div = document.getElementById(`div${quote.id}`)
        while (div.hasChildNodes()) {
            div.removeChild(div.firstChild);
        }
        createDivContent(div, quote)
    }

    function deleteQuote(quote) {
        const p = document.getElementById(`quote${quote.id}`)
        p.parentNode.removeChild(p)
        fetch(`${BASEURL}/quotes/${quote.id}`, DELETEOBJ)
        .then(resp => resp.json())
    }

    getQuotes()

})