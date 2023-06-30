import { writable } from 'svelte/store';

export const projectData = writable([]);
export const projectSavePath = writable("");
export const imgPath = writable("");
export const dataAdded = writable(false);

export const projectDataLoaded = writable(false);

export const exampleData = writable([{
                                "name": "風景照1",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/56.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照2",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/57.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照3",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/58.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照4",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/59.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照5",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/77.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照6",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/60.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照7",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/61.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照8",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/62.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            },
                            {
                                "name": "風景照9",
                                "filepath": "https://d2rkn6fj2nuekp.cloudfront.net/edms/63.jpg",
                                "annotations" : [],
                                "shpInfo" : {}
                            }]);

