const toCurrency = price => {
    return new Intl.NumberFormat('en-en', {
        currency: 'usd',
        style: 'currency'
    }).format(price)
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
});

const $card = document.querySelector('#card');

if ($card) {

    $card.addEventListener('click', e => {
        
        if (e.target.classList.contains('js-remove')) {

            const id = e.target.dataset.id;
            const csrf = e.target.dataset.csrf;
            
            fetch('/card/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            })
            .then(res => res.json())
            .then(card => {
                if (card.courses.length) {
                    const html = card.courses.map(c => {
                        return `
                            <tr>
                            <td><img src="${c.img}" alt="${c.title}" height="50px" width="50px">${c.title}</td>
                                <td>${c.count}</td>
                                <td>
                                    <button class="btn btn-small js-remove" data-id="${c.id}">Delete</button>
                                </td>
                            </tr>
                        `
                    }).join('');
                    $card.querySelector('tbody').innerHTML = html;
                    $card.querySelector('.price').textContent = toCurrency(card.price);
                } else {
                    $card.innerHTML = '<p>Card is empty</p>'
                }
            });

        }
    });
}

// const toDate = date => {
//     return new Intl.DateTimeFormat('ru-Ru', {
//         day: '2-digit',
//         month: 'long',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit'
//     }).format(new Date(date));
// }

// document.querySelectorAll('.date').forEach(node => {
//     node.textContent = toDate(node.textContent);
// });

M.Tabs.init(document.querySelectorAll('.tabs')); // for correct tabs work
