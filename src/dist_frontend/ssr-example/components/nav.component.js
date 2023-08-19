import { textNode, markup, hydrate, detectChanges, detachDetector, getState, setState } from 'slingjs/sling.min.es5';
import { slGet } from 'slingjs/sling-xhr.min';

class NavComponent {
    constructor() {
        this.ssrContent = '';
        this.rootRoute = 'http://127.0.0.1:1337/';
        this.hydrateRoute = this.rootRoute + 'hydrate';
        this.hydrateIslandRoute = this.rootRoute + 'hydratecomplex';
        this.toggleRoute = this.rootRoute + 'toggle';
        this.toggleComplexRoute = this.rootRoute + 'togglewithstate';
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
                                hydrate('divroot');
                            });
                        } else {
                            this.renderRouterOutlet(resp.response);
                            hydrate('divroot');
                        }
                    });
                } else {
                    this.renderRouterOutlet(resp.response);
                    hydrate('divroot');
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

    navigateToStateToggle() {
        slGet(this.toggleRoute)
            .then(resp => {
                import(/* webpackChunkName: "test4.server.component" */ './test4.server.component.js').then(module => {
                    window.Test4Component = module.default;

                    this.renderRouterOutlet(resp.response);
                });
            });
    }

    navigateToStateToggleComplex() {
        slGet(this.toggleComplexRoute)
            .then(resp => {
                import(/* webpackChunkName: "test5.server.component" */ './test5.server.component.js').then(module => {
                    window.Test5Component = module.default;

                    this.renderRouterOutlet(resp.response);
                });
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
                markup('button', {
                    attrs: {
                        onclick: this.navigateToStateToggle.bind(this)
                    },
                    children: [
                        textNode('Toggle Route')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.navigateToStateToggleComplex.bind(this)
                    },
                    children: [
                        textNode('Toggle Route Complex')
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
