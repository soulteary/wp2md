const fse = require('fs-extra');
const moment = require('moment');
const toMarkdown = require('./lib/to-markdown');
const path = require('path');

const CWD = process.cwd();

module.exports = function (exportFilePath, timezoneFix, useCustomCategories, customCategoriesFn) {

    const exportData = fse.readJSONSync(path.relative('.', exportFilePath));

    let {data} = exportData;
    let {posts, tags, posts_tags, users} = data;
    let disableTimeZoneFix = timezoneFix === 'off';

    let postData = {};
    let tagData = {};

    return Promise.resolve(posts.reduce(function (promiseFactory, post) {
        return promiseFactory.then(function () {

            let date = post.published_at;
            if (disableTimeZoneFix) {
                date = date.slice(0, -6);
            }

            let categories = [];
            // hack for myself
            if (useCustomCategories === true) {
                if (typeof customCategoriesFn === 'function') {
                    let customFnResult = customCategoriesFn(post.categories);
                    categories = customFnResult ? customFnResult : [];
                } else {
                    categories = post.categories ? post.categories.map(function (category) {
                        if (category.slug.indexOf('-learning') > -1 ||
                            category.slug.indexOf('-knowledge') > -1 ||
                            category.slug === 'sql' || category.slug === 'reference-room') {

                            const catsMap = {
                                'backend-knowledge': [
                                    'backend-knowledge',
                                    'c-learning',
                                    'php-learning',
                                    'asp-learning',
                                    'sql'
                                ],
                                'system-knowledge': [
                                    'system-knowledge',
                                    'dos-learning',
                                    'windows-learning',
                                    'linux-learning',
                                    'system-knowledge'
                                ],
                                'frontend-knowledge': [
                                    'frontend-knowledge',
                                    'web-learning',
                                    'javascript-learning',
                                    'css-learning',
                                    'html-learning'
                                ],
                                'desktop-knowledge': [
                                    'desktop-knowledge',
                                    'desktop-knowledge',
                                    'vb-learning'
                                ],
                                'reference-room': [
                                    'reference-room'
                                ]
                            };

                            Object.keys(catsMap).forEach(function (label) {
                                if (catsMap[label].indexOf(category.slug) > -1) {
                                    category.slug = label;
                                }
                            });

                            return [
                                {
                                    name: '学习点滴',
                                    slug: 'knowledge'
                                },
                                {
                                    name: category.name,
                                    slug: 'knowledge/' + category.slug,
                                }
                            ]
                        }

                        if (['uncategorized', 'trivia', 'diary'].indexOf(category.slug) > -1) {
                            return [
                                {
                                    name: '生活点滴',
                                    slug: 'life'
                                },
                                {
                                    name: category.name,
                                    slug: 'life/' + category.slug,
                                }
                            ]
                        }

                        if (['my-works', 'my-summary', 'my-design'].indexOf(category.slug) > -1) {
                            return [
                                {
                                    name: '关于苏洋',
                                    slug: 'about'
                                },
                                {
                                    name: category.name,
                                    slug: 'about/' + category.slug,
                                }
                            ]
                        }

                        if (['past-records', 'software', 'media', 'tips', 'leisure-moment'].indexOf(category.slug) > -1) {
                            return [
                                {
                                    name: '资源分享',
                                    slug: 'share'
                                },
                                {
                                    name: category.name,
                                    slug: 'share/' + category.slug,
                                }
                            ]
                        }

                        return {
                            name: category.name,
                            slug: category.slug,
                        }
                    }) : [];
                }
            }

            // plain array
            categories = categories.reduce(function (prev, item) {
                return prev.concat(item)
            }, []);

            if (post.image) {
                post.imageHTML = `# 额外图片\n\n\n![](${post.image})`;
            }

            return toMarkdown(post.html, {gfm: true}).then(function (content) {
                postData[post.id] = {
                    'date': post.published_at,
                    'dataFormated': moment(Date.parse(date)).format('YYYY/MM/DD'),
                    'title': post.title,
                    'slug': post.slug,
                    'markdown': content,
                    'image': post.image,
                    'page': post.page,
                    'status': post.status,
                    categories,
                    'created_at': post.created_at,
                    'updated_at': post.updated_at
                };
            }).catch(function (error) {
                throw Error(error);
            });
        }).catch(function (error) {
            throw Error(error);
        });
    }, Promise.resolve())).then(function () {

        tags.map(function (tag) {
            const {id, name, slug} = tag;
            tagData[tag.id] = {id, name, slug};
        });

        posts_tags.map(function (data) {
            const id = data.post_id;
            if (postData.hasOwnProperty(id)) {
                postData[id].tag = postData[id].tag || [];
                postData[id].tag.push(data.tag_id);
            } else {
                console.log('不存在此文章ID', data, tagData[data.tag_id]);
            }
        });

        return true;
    }).then(function () {

        let count = 0;
        return Object.keys(postData).map(function (id) {
            const rootDir = path.resolve(CWD, 'export/' + postData[id].status);
            let postPath = '';

            // 将page页面单独保存
            if (postData[id].page !== 0) {
                postPath = path.resolve(rootDir, 'page', postData[id].dataFormated);
            } else {
                postPath = path.resolve(rootDir, postData[id].dataFormated);
            }

            fse.mkdirs(postPath, function (err) {
                if (err) {
                    return console.error('初始化文章路径出现错误:', err);
                }

                let filePath = '';
                let needAlias = false;

                // 含有转义中文路径的的文章使用中文名称保存
                if (postData[id].slug.indexOf('%') > -1) {
                    needAlias = true;
                    filePath = [postPath, postData[id].title].join('/');
                } else {
                    filePath = [postPath, postData[id].slug].join('/');
                }

                let markdownContent = postData[id].markdown;
                delete postData[id].markdown;

                if (postData[id].tag) {
                    postData[id].tag = postData[id].tag.map(
                        tagId => tagData[tagId] ? tagData[tagId].name : ''
                    );
                }

                if (needAlias) {
                    postData[id].alias = postData[id].slug;
                }

                fse.outputJSON(filePath + '.json', postData[id], function (err) {
                    if (err) {
                        return console.error('输出博客META文件出现错误:', err);
                    }
                });

                fse.outputFile(filePath + '.md',
                    ['# ' + postData[id].title,
                        markdownContent,
                        postData[id].imageHTML
                    ].join('\n\n'), function (err) {
                        if (err) {
                            return console.error('输出博客文章出现错误:', err);
                        }
                        console.log(`[${(++count)}]输出文件: .${filePath.slice(rootDir.length)}`);
                    });
            });
        });
    }).then(function () {
        return console.log('用户数据，请自行处理:', users);
    }).catch(function (error) {
        return console.log(error);
    });
};
