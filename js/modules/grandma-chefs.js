// Grandma's Little Chefs
// A cookbook of recipes the girls want Grandma to make with them.
// Every recipe lives right here in this file and renders as its own
// collapsible card, so the page only shows one recipe at a time.
//
// TO ADD A RECIPE: copy one block in the RECIPES array below and edit it.
// Fields:
//   id          - short kebab-case slug, must be unique
//   title       - recipe name shown on the card
//   emoji       - one emoji for the card
//   askedBy     - (optional) which girl asked for it, e.g. 'Noga 🦫'
//   blurb       - one friendly sentence
//   meta        - (optional) little chips: [{ icon, label }]
//   ingredients - array of strings (start each with an emoji if you like)
//   steps       - array of strings, shown as a numbered list
//   tips        - (optional) array of strings
(function() {
    'use strict';

    const RECIPES = [
        {
            id: 'ketons-pickles',
            title: "Keton's Magic Pickles",
            emoji: '🥒',
            blurb: 'Crunchy sour pickles! We do a little work, then wait a whole week for the magic to happen.',
            meta: [
                { icon: '🫙', label: 'Makes one big jar' },
                { icon: '⏱️', label: '30 min of work' },
                { icon: '📅', label: 'Then wait 1 week' }
            ],
            ingredients: [
                '🥒 1 kg (about 2 lb) small crunchy cucumbers, sliced',
                '🌶️ 1 small green hot pepper, cut in half, seeds scooped out',
                '🧄 Half a head of garlic',
                '🌿 A little bunch of fresh dill',
                '🥬 1 stick of celery, chopped',
                '🍶 ⅓ cup (80 ml) white vinegar',
                '🍬 1 big heaping spoon of sugar',
                '🧂 2 spoons of salt',
                '💧 Water'
            ],
            steps: [
                '🚿 Wash the cucumbers really, really well.',
                '🫙 Pack the cucumbers into a big jar with the hot pepper, garlic, dill, and celery.',
                '🥣 In a bowl, stir the vinegar, sugar, and salt until they melt away.',
                '⬇️ Pour the bowl mix over the cucumbers in the jar.',
                '💧 Add water until everything is hiding under the water. Close the lid tight!',
                '🌡️ Leave the jar on the counter (NOT the fridge) for 1 whole week.',
                '❄️ Move the jar to the fridge. Now… CRUNCH! 😋'
            ],
            tips: [
                '🧊 They stay yummy in the fridge for at least a couple of months.',
                '🥬 You can pickle cabbage and cauliflower the same way — just cut them into bite-size pieces.'
            ]
        }
    ];

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function buildCard(recipe) {
        const card = el('details', 'chef-recipe');
        card.id = 'recipe-' + recipe.id;

        const summary = el('summary', 'chef-recipe-summary');
        summary.appendChild(el('span', 'chef-recipe-emoji', recipe.emoji || '🍳'));
        summary.appendChild(el('span', 'chef-recipe-name', recipe.title));
        if (recipe.askedBy) {
            summary.appendChild(el('span', 'chef-recipe-asked', 'asked by ' + recipe.askedBy));
        }
        card.appendChild(summary);

        const body = el('div', 'chef-recipe-body');

        if (recipe.blurb) body.appendChild(el('p', 'chef-recipe-blurb', recipe.blurb));

        if (recipe.meta && recipe.meta.length) {
            const meta = el('div', 'chef-recipe-meta');
            recipe.meta.forEach(function(m) {
                const chip = el('span', 'chef-chip');
                chip.appendChild(el('span', 'chef-chip-icon', m.icon || ''));
                chip.appendChild(el('span', null, m.label || ''));
                meta.appendChild(chip);
            });
            body.appendChild(meta);
        }

        if (recipe.ingredients && recipe.ingredients.length) {
            body.appendChild(el('h3', 'chef-recipe-heading', '🛒 What we need'));
            const ul = el('ul', 'chef-ingredients');
            recipe.ingredients.forEach(function(i) { ul.appendChild(el('li', null, i)); });
            body.appendChild(ul);
        }

        if (recipe.steps && recipe.steps.length) {
            body.appendChild(el('h3', 'chef-recipe-heading', '👩‍🍳 What we do'));
            const ol = el('ol', 'chef-steps');
            recipe.steps.forEach(function(s) { ol.appendChild(el('li', null, s)); });
            body.appendChild(ol);
        }

        if (recipe.tips && recipe.tips.length) {
            body.appendChild(el('h3', 'chef-recipe-heading', '💡 Good to know'));
            const ul = el('ul', 'chef-tips');
            recipe.tips.forEach(function(t) { ul.appendChild(el('li', null, t)); });
            body.appendChild(ul);
        }

        card.appendChild(body);
        return card;
    }

    window.GrandmaChefs = {
        init: function() {
            const list = document.getElementById('chefs-list');
            if (!list) return;

            list.innerHTML = '';
            RECIPES.forEach(function(recipe) { list.appendChild(buildCard(recipe)); });

            const count = document.getElementById('chefs-count');
            if (count) {
                count.textContent = RECIPES.length === 1
                    ? '1 recipe so far'
                    : RECIPES.length + ' recipes so far';
            }
        }
    };
})();
