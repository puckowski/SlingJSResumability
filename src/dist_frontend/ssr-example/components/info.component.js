import { textNode, markup } from 'slingjs/sling.min.es5';

class InfoComponent {
    constructor() {
    }

    slStyle() {
        return 'div { background-color: #1A5276; }';
    }

    view() {
        return markup('div', {
            attrs: {
                id: 'divinfo',
            },
            children: [
                textNode('This component uses component scoped CSS.'),
            ]
        })
    }
}

export default InfoComponent;
