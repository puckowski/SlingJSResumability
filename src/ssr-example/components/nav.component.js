import { textNode, markup, hydrate, detectChanges, detachDetector, getState, setState } from 'slingjs/sling.min.es5';
import { slGet } from 'slingjs/sling-xhr.min';

class NavComponent {
    constructor() {
        this.ssrContent = '';
        this.rootRoute = 'http://127.0.0.1:1337/';
        this.hydrateRoute = this.rootRoute + 'hydrate';
        this.hydrateIslandRoute = this.rootRoute + 'hydratecomplex';
        this.chunkLoadedIsland = false;
        this.chunkLoadedHydrate = false;
    }

    slOnInit() {
        const state = {
            island: this.chunkLoadedIsland,
            hydrate: this.chunkLoadedHydrate
        };

        setState(state);
    }

    renderRouterOutlet(content) {
        this.ssrContent = content;
        detachDetector('divrouteroutlet');
        detectChanges();
        hydrate('divrouteroutlet');
    }

    navigateToIsland() {
        slGet(this.hydrateIslandRoute)
            .then(resp => {
                const state = getState();

                if (!state.island) {
                    state.island = true;

                    import(/* webpackChunkName: "test3.server.component" */ './test3.server.component.js').then(module => {
                        window.Test3Component = module.default;

                        if (!state.hydrate) {
                            state.hydrate = true;

                            import(/* webpackChunkName: "test2.server.component" */ './test2.server.component.js').then(module => {
                                window.Test2Component = module.default;

                                this.renderRouterOutlet(resp.response);
                            });
                        } else {
                            this.renderRouterOutlet(resp.response);
                        }
                    });
                } else {
                    this.renderRouterOutlet(resp.response);
                }

                setState(state);
            }
            );
    }

    navigateToHydrate() {
        slGet(this.hydrateRoute)
            .then(resp => {
                const state = getState();

                if (!state.hydrate) {
                    state.hydrate = true;

                    import(/* webpackChunkName: "test2.server.component" */ './test2.server.component.js').then(module => {
                        window.Test2Component = module.default;

                        this.renderRouterOutlet(resp.response);
                    });
                } else {
                    this.renderRouterOutlet(resp.response);
                }

                setState(state);
            });
    }

    navigateToRoot() {
        slGet(this.rootRoute)
            .then(resp => {
                this.ssrContent = resp.response;
                detachDetector('divrouteroutlet');
                detectChanges();
                hydrate('divrouteroutlet');
            });
    }

    view() {
        return markup('div', {
            attrs: {
                id: 'divnav',
            },
            children: [
                textNode('Select a route to navigate to.'),
                markup('button', {
                    attrs: {
                        onclick: this.navigateToHydrate.bind(this)
                    },
                    children: [
                        textNode('Hydrate Route')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.navigateToRoot.bind(this)
                    },
                    children: [
                        textNode('Root Route')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.navigateToIsland.bind(this)
                    },
                    children: [
                        textNode('Hydrate Island Route')
                    ]
                }),
                markup('div', {
                    attrs: {
                        sldirective: 'trustchildren'
                    },
                    children: [
                        textNode(this.ssrContent)
                    ]
                })
            ]
        })
    }
}

export default NavComponent;
