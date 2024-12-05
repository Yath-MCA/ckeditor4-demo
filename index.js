document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

           window.iGetFragment = (_String, Options = {}) => {

            try {
                let frag = document.createRange().createContextualFragment(_String);
                if (Object.keys(Options).length == 0) {
                    return frag;
                } else if (Options.tag) {
                    let elm = document.createElement(Options.tag);
                    elm.append(frag);
                    return elm;
                } else return frag;
            } catch (err) {
                console.warn(err.message);
                ErrorLogTrace('iFragment', err.message);
            }
        };
        var initialData = `<para>Since a conveyance of &ldquo;dutiable property&rdquo; is what is brought to duty, what is &ldquo;dutiable property assumes some importance. &ldquo;Dutiable property&rdquo; is defined in s 4 as follows:<list>
                            <item>&ldquo;(a) land; </item>
                            <item>(b) the goodwill of a business undertaking carried on or to be carried on in the Territory, or in the Territory and elsewhere, including any restraint of trade arrangement which, in the opinion of the Commissioner, enhances or is likely to enhance the value of the business; </item>
                            </list>and includes an estate or interest (which may be a partnership interest) in dutiable property.</para>
                            <br>`;

        function replaceAllSplit(data, search, replacement) {
            var target = data;
            var loop = 0;
            while (target.indexOf(search)) {
                target = target.split(search).join(replacement);
                if (loop > 10) {
                    break;
                } else loop++;
            }
            return target;
        };
        var PasteFilter = {
            formatTagArr: ['bold', 'strong', 'b', 'em', 'italic', 'i', 'sup', 'u', 'sub', 'super', 'subscript', 'superscript', 'sc', 'smallcaps', 'underline'],
            Inside_TagArr: ['bold', 'strong', 'b', 'em', 'italic', 'i', 'sup', 'u', 'sub', 'super', 'subscript', 'superscript', 'sc', 'smallcaps', 'underline', 'commwrap', 'releasewrap', 'lawref', 'url-wrap'],
            excludeNode: ['caption', 'title'],
            retain: ['text-decoration', 'font-style', 'font-weight', 'vertical-align'],
            replace_info: {
                "font-weight": {
                    class: "bold",
                    tag: "strong"
                },
                "font-style": {
                    class: "italic",
                    tag: "em"
                },
                "text-decoration": {
                    class: "underline",
                    tag: "u"
                },
                "vertical-align": {
                    "text-top": {
                        class: "superscript",
                        tag: "sup"
                    },
                    "super": {
                        class: "superscript",
                        tag: "sup"
                    },
                    "text-bottom": {
                        class: "subscript",
                        tag: "sub"
                    },
                    "sub": {
                        class: "subscript",
                        tag: "sub"
                    }
                },
            },
            SPACE: ' ',
            replace_empty_values: ['&nbsp;&nbsp;', '  ', '  ', '\\n\\n', '\\n'],
            remove_elm_tags: ['br', 'style', 'script'],
            empty_values: ['&nbsp;', '', ' '],
            tagsAsString: {
                "\\\\&quot;": '"',
                "&lt;": "<",
                "&gt;": ">",
                "&quot;": '"',
                "\\x3C;": "<",
                "<br/>": " ",
                "<br />": " ",
                "<br>": " ",
                "  ": " "
            },
            escape_entity: ['\\u[a-fA-F0-9]{4}', '\\x[a-fA-F0-9]{2}', '\\(?:[1-7][0-7]{0,2}|[0-7]{2,3})'],
            iGetFragment: (_String, Options = {}) => {
                try {
                    let frag = document.createRange().createContextualFragment(_String);
                    if (Object.keys(Options).length == 0) {
                        return frag;
                    } else if (Options.tag) {
                        let elm = document.createElement(Options.tag);
                        elm.append(frag);
                        return elm;
                    } else
                        return frag;
                } catch (err) {
                    console.warn(err.message);
                }
            },
            fire: function(data, Option, _ = PasteFilter) {
                /* 
                    LAST_UPDATE ==> 07_FEB_23-YA ==> PASTE IN QRY.CMD DIALOG
                    https://javascript.info/selection-range
                    https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
                    https://developer.mozilla.org/en-US/docs/Web/API/Selection/deleteFromDocument
                */
                try {
                    _.Option = Option = Option ? Option : (_.default_params);
                    [_.eventhandler, _.e] = [Option.event_from, Option.e];
                    _.DOM = document.getElementById('ccc') || document.createElement("span");
                    _.DOM.classList.add("paste-filter");
                    if (!data) {
                        data = _.Get_Set_PasteData(_.e, {
                            getData: true
                        });
                    }
                    let sel = document.getSelection();
                    let IsWindowSelection = sel.toString().length > 0 ? true : false;
                    if (typeof data == "string") {
                        if (data.match(/&lt|&gt|&quot|x3C|<br>/) && !["copy", "docStatics"].includes(this.e.name)) {
                            // ? 02-jul-22
                            for (let tag in this.tagsAsString) {
                                data = replaceAllSplit(data, tag, this.tagsAsString[tag]);
                            }
                        }
                        var frag = document.createRange().createContextualFragment(data);
                        $(_.DOM).html('').append(frag);
                    }
                    _.ErrorEvent = false;
                    var reTurnData = "";
                    if (Option.plain_text) {
                        reTurnData = _.DOM.textContent.trim();
                        // return  (IsWindowSelection) ? _.Update_Selection(text) :  text;
                    }
                    if (_.DOM.childNodes.length > 0) {
                        reTurnData = data;
                        //? if the Text available with in the Editor
                        if (Option.isExternal_Paste) {
                            _.processNode_Editor(_.DOM);
                        } else { //? its Text come outside of the Editor

                            //return reTurnData = _.formatContent(_.DOM.innerHTML)
                            _.LoopMethod(_.DOM);
                            _.remove_span();
                            //_.cleanNode(_.DOM)
                            // _.processNode_Editors(_.DOM);
                            // return reTurnData = _.processNode_TEXT(_.DOM.innerHTML)
                        }

                        reTurnData = _.DOM.innerHTML.trim();
                        _.DOM.innerHTML = '';
                    }
                    return reTurnData;
                } catch (err) {
                    console.warn(err.message);
                }
            },
            processNode_TEXT: function(node) {
                if (node.nodeType === 1) { // Element node
                    const childNodes = Array.from(node.childNodes);
                    for (let i = 0; i < childNodes.length; i++) {
                        const currentNode = childNodes[i];
                        const nextNode = childNodes[i + 1];

                        // Process child nodes recursively
                        processNode(currentNode);

                        // Add space between this node and the next node if both are text or element nodes
                        if (
                            nextNode &&
                            ((currentNode.nodeType === 3 && nextNode.nodeType === 1) || // Text followed by element
                                (currentNode.nodeType === 1 && nextNode.nodeType === 3) || // Element followed by text
                                (currentNode.nodeType === 1 && nextNode.nodeType === 1)) // Element followed by element
                        ) {
                            const spaceNode = document.createTextNode(' ');
                            node.insertBefore(spaceNode, nextNode);
                        }
                    }
                } else {
                    return node;
                }
            },
            formatContent: function(html) {
                // Allowed formatting tags
                const allowedTags = ['strong', 'em', 'u', 'sup', 'sub'];

                // Style-to-tag mapping
                const replace_info = {
                    "font-weight": {
                        tag: "strong"
                    },
                    "font-style": {
                        tag: "em"
                    },
                    "text-decoration": {
                        tag: "u"
                    },
                    "vertical-align": {
                        "text-top": {
                            tag: "sup"
                        },
                        "super": {
                            tag: "sup"
                        },
                        "text-bottom": {
                            tag: "sub"
                        },
                        "sub": {
                            tag: "sub"
                        }
                    }
                };

                // Create a container to parse the input HTML
                const container = document.createElement('div');
                container.innerHTML = html;

                // Recursive function to process nodes
                function processNode(node) {
                    if (node.nodeType === 3) { // Text node
                        // Preserve text content (including special characters)
                        return node.nodeValue.trim();
                    }

                    if (node.nodeType === 1) { // Element node
                        const tagName = node.tagName.toLowerCase();

                        // Handle inline styles (convert to tags)
                        if (node.hasAttribute('style')) {
                            const style = node.getAttribute('style');
                            const styles = style.split(';').map(s => s.trim()).filter(Boolean);

                            styles.forEach(styleRule => {
                                const [property, value] = styleRule.split(':').map(s => s.trim());
                                const styleInfo = replace_info[property];
                                if (styleInfo) {
                                    if (typeof styleInfo === 'object' && styleInfo[value]) {
                                        wrapWithFormattingTag(node, styleInfo[value].tag);
                                    } else if (styleInfo.tag) {
                                        wrapWithFormattingTag(node, styleInfo.tag);
                                    }
                                }
                            });

                            // Remove the style attribute after processing
                            node.removeAttribute('style');
                        }

                        // If the tag is allowed, keep it and process its children
                        if (allowedTags.includes(tagName)) {
                            const wrapper = document.createElement(tagName);
                            Array.from(node.childNodes).forEach(child => {
                                const processedChild = processNode(child);
                                if (processedChild) wrapper.innerHTML += processedChild;
                            });
                            return wrapper.outerHTML;
                        }

                        // If not an allowed tag, unwrap it and process its children
                        return Array.from(node.childNodes)
                            .map(child => processNode(child))
                            .join('');
                    }

                    return ''; // Ignore other node types
                }

                // Helper function to wrap a node with a specific tag
                function wrapWithFormattingTag(node, tagName) {
                    const wrapper = document.createElement(tagName);
                    while (node.firstChild) {
                        wrapper.appendChild(node.firstChild);
                    }
                    if (node.parentNode) {
                        node.parentNode.replaceChild(wrapper, node);
                    }
                }

                // Process all child nodes
                const result = Array.from(container.childNodes)
                    .map(node => processNode(node))
                    .join('');

                // Clean up excessive spaces while preserving single spaces
                return result.replace(/\s+/g, ' ').trim();
            },
            getParentElement: function(editor) {
                const selection = editor.getSelection();
                const range = selection && selection.getRanges()[0];

                if (range) {
                    const startNode = range.startContainer;

                    if (startNode) {
                        // If the start container is an element itself, start checking
                        let currentNode = startNode.type === CKEDITOR.NODE_ELEMENT ?
                            startNode :
                            new CKEDITOR.dom.node(startNode.$.parentNode); // For text nodes, get parent node

                        // Traverse up the DOM tree until a non-<ins>/<del> element is found
                        while (currentNode && (currentNode.getName() === 'ins' || currentNode.getName() === 'del')) {
                            currentNode = currentNode.getParent();
                        }

                        return currentNode || null; // Return the first valid parent or null if none found
                    }
                }

                return null; // No valid parent element found
            },
            validatePastedContent: function(content, parentElement, dtdRules) {
                let parentName = parentElement.getName(); // Get the name of the parent element
                dtdRules = {
                    "colspec": {
                        "type": "empty",
                        "children": [],
                        "attribute": []
                    },
                    "break": {
                        "type": "empty",
                        "children": [],
                        "attribute": []
                    },
                    "entry": {
                        "type": "child",
                        "children": ["%entrycon;"],
                        "attribute": ["align", "valign", "char"]
                    },
                    "row": {
                        "type": "child",
                        "children": ["entry"],
                        "attribute": ["rowsep"]
                    },
                    "spanspec": {
                        "type": "empty",
                        "children": [],
                        "attribute": []
                    },
                    "table": {
                        "type": "child",
                        "children": ["xml_title", "tgroup"],
                        "attribute": ["frame", "rowsep", "colsep"]
                    },
                    "tbody": {
                        "type": "child",
                        "children": ["row"],
                        "attribute": ["rowsep", "valign"]
                    },
                    "tgroup": {
                        "type": "child",
                        "children": ["colspec", "spanspec", "thead", "tfoot", "tbody"],
                        "attribute": ["cols", "align"]
                    },
                    "thead": {
                        "type": "child",
                        "children": ["row"],
                        "attribute": []
                    },
                    "tfoot": {
                        "type": "child",
                        "children": ["row"],
                        "attribute": []
                    },
                    "xml_title": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "h1": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "h2": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "h2": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "h3": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "h4": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "h5": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "p": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap", "ol", "ul", "example", "example_reference", "quote", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note"],
                        "attribute": []
                    },
                    "ol": {
                        "type": "child",
                        "children": ["xml_title", "h1", "li"],
                        "attribute": ["spacing"]
                    },
                    "ul": {
                        "type": "child",
                        "children": ["xml_title", "h1", "li"],
                        "attribute": ["spacing"]
                    },
                    "li": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap", "ol", "ul", "example", "example_reference", "quote", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note"],
                        "attribute": []
                    },
                    "item_continued": {
                        "type": "child",
                        "children": ["em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap", "ol", "ul", "example", "example_reference", "quote", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "item_continued"],
                        "attribute": []
                    },
                    "date": {
                        "type": "empty",
                        "children": [],
                        "attribute": []
                    },
                    "pre": {
                        "type": "child",
                        "children": ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders", "quote_note"],
                        "attribute": []
                    },
                    "quote_note": {
                        "type": "child",
                        "children": ["em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "address_group": {
                        "type": "child",
                        "children": ["h1", "h2", "h3", "xml_address"],
                        "attribute": []
                    },
                    "xml_address": {
                        "type": "child",
                        "children": ["line"],
                        "attribute": []
                    },
                    "line": {
                        "type": "child",
                        "children": ["em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "example": {
                        "type": "child",
                        "children": ["xml_title", "h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders"],
                        "attribute": []
                    },
                    "example_reference": {
                        "type": "child",
                        "children": ["example"],
                        "attribute": []
                    },
                    "table_reference": {
                        "type": "child",
                        "children": ["table"],
                        "attribute": []
                    },
                    "media_specific": {
                        "type": "child",
                        "children": ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders"],
                        "attribute": []
                    },
                    "graphic": {
                        "type": "child",
                        "children": ["#PCDATA", "graphic_text"],
                        "attribute": []
                    },
                    "graphic_text": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "external_object": {
                        "type": "child",
                        "children": ["#PCDATA", "graphic"],
                        "attribute": []
                    },
                    "authors": {
                        "type": "child",
                        "children": ["xml_title", "author"],
                        "attribute": []
                    },
                    "author": {
                        "type": "child",
                        "children": ["xml_title", "p"],
                        "attribute": []
                    },
                    "footnote": {
                        "type": "child",
                        "children": ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders", "ibid"],
                        "attribute": []
                    },
                    "ibid": {
                        "type": "empty",
                        "children": [],
                        "attribute": []
                    },
                    "fraction": {
                        "type": "child",
                        "children": ["numerator", "denominator"],
                        "attribute": []
                    },
                    "numerator": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "denominator": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "sup": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u"],
                        "attribute": []
                    },
                    "inf": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u"],
                        "attribute": []
                    },
                    "leaders": {
                        "type": "empty",
                        "children": [],
                        "attribute": []
                    },
                    "call": {
                        "type": "child",
                        "children": ["law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "lawref": {
                        "type": "child",
                        "children": ["#PCDATA", "xref"],
                        "attribute": []
                    },
                    "caseref": {
                        "type": "child",
                        "children": ["#PCDATA", "party", "citation", "xref", "extra", "unreported"],
                        "attribute": []
                    },
                    "party": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "citation": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "extra": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u"],
                        "attribute": []
                    },
                    "unreported": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u"],
                        "attribute": []
                    },
                    "releaseref": {
                        "type": "child",
                        "children": ["#PCDATA", "xref"],
                        "attribute": []
                    },
                    "xref": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "pageref": {
                        "type": "child",
                        "children": ["#PCDATA", "fnref"],
                        "attribute": []
                    },
                    "fnref": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "words": {
                        "type": "child",
                        "children": ["#PCDATA", "actname", "casename", "propername", "latinname", "pending", "former", "inf", "sup"],
                        "attribute": []
                    },
                    "actname": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "casename": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "propername": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "latinname": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "pending": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "former": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "commref": {
                        "type": "child",
                        "children": ["#PCDATA", "xref"],
                        "attribute": []
                    },
                    "urlref": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "crossref": {
                        "type": "child",
                        "children": ["#PCDATA", "xref"],
                        "attribute": []
                    },
                    "em": {
                        "type": "child",
                        "children": ["#PCDATA", "footnote", "sup", "inf", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "strong": {
                        "type": "child",
                        "children": ["#PCDATA", "footnote", "sup", "inf", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "u": {
                        "type": "child",
                        "children": ["#PCDATA", "footnote", "sup", "inf", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "toc": {
                        "type": "child",
                        "children": ["xml_title", "h1", "h2", "h3", "h4", "content"],
                        "attribute": []
                    },
                    "content": {
                        "type": "child",
                        "children": ["ent", "reference"],
                        "attribute": []
                    },
                    "ent": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "footnote", "sup", "inf"],
                        "attribute": []
                    },
                    "reference": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "media_specific"],
                        "attribute": []
                    },
                    "xml_template": {
                        "type": "child",
                        "children": ["xml_title", "h1", "h2", "p", "ol", "ul", "table", "external_object"],
                        "attribute": []
                    },
                    "note": {
                        "type": "child",
                        "children": ["xml_title", "h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders"],
                        "attribute": []
                    },
                    "appendix": {
                        "type": "child",
                        "children": ["xml_title", "toc", "h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders", "signatures"],
                        "attribute": []
                    },
                    "text": {
                        "type": "child",
                        "children": ["xml_title", "toc", "h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders", "wysiwyg"],
                        "attribute": []
                    },
                    "ellip": {
                        "type": "empty",
                        "children": [],
                        "attribute": []
                    },
                    "signatures": {
                        "type": "child",
                        "children": ["p"],
                        "attribute": []
                    },
                    "release_date": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "catchwords": {
                        "type": "child",
                        "children": ["em", "strong", "u", "sup", "inf", "footnote", "fraction", "leaders", "break", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "byline": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u"],
                        "attribute": []
                    },
                    "intro": {
                        "type": "child",
                        "children": ["xml_title", "h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders", "authors"],
                        "attribute": []
                    },
                    "disclaimerref": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "copyrightref": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "letter": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "meaning": {
                        "type": "child",
                        "children": ["#PCDATA", "caseref", "commref", "lawref", "releaseref", "urlref", "em", "strong", "u", "break", "inf", "sup", "ol", "ul", "note", "example", "example_reference", "table", "table_reference", "graphic", "p"],
                        "attribute": []
                    },
                    "abbreviation_list": {
                        "type": "child",
                        "children": ["xml_title", "h1", "p", "ol", "ul", "media_specific", "abbreviation", "abbreviation_block"],
                        "attribute": []
                    },
                    "abbreviation_block": {
                        "type": "child",
                        "children": ["letter", "abbreviation"],
                        "attribute": []
                    },
                    "abbreviation": {
                        "type": "child",
                        "children": ["short_term", "meaning", "abbreviation_ref"],
                        "attribute": []
                    },
                    "short_term": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "abbreviation_ref": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    },
                    "abbreviation_list_reference": {
                        "type": "child",
                        "children": ["abbreviation_list"],
                        "attribute": []
                    },
                    "commblock": {
                        "type": "child",
                        "children": ["xml_title", "authority", "byline", "intro", "points", "glossary", "abbreviation_list"],
                        "attribute": []
                    },
                    "commblock_reference": {
                        "type": "child",
                        "children": ["commblock"],
                        "attribute": []
                    },
                    "authority": {
                        "type": "child",
                        "children": ["xml_title", "reference"],
                        "attribute": []
                    },
                    "points": {
                        "type": "child",
                        "children": ["xml_title", "point"],
                        "attribute": []
                    },
                    "point": {
                        "type": "child",
                        "children": ["xml_title", "h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders", "call"],
                        "attribute": []
                    },
                    "related_item": {
                        "type": "child",
                        "children": ["media_specific", "p"],
                        "attribute": []
                    },
                    "precedent": {
                        "type": "child",
                        "children": ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ol", "ul", "pre", "example", "example_reference", "address_group", "media_specific", "external_object", "graphic", "table", "table_reference", "note", "leaders"],
                        "attribute": []
                    },
                    "glossary": {
                        "type": "child",
                        "children": ["h1", "p", "ol", "ul", "media_specific", "table", "glossary_block"],
                        "attribute": []
                    },
                    "glossary_block": {
                        "type": "child",
                        "children": ["letter", "glossary_entry"],
                        "attribute": []
                    },
                    "glossary_entry": {
                        "type": "child",
                        "children": ["glossary_term", "meaning", "glossary_ref"],
                        "attribute": []
                    },
                    "glossary_term": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u"],
                        "attribute": []
                    },
                    "glossary_ref": {
                        "type": "child",
                        "children": ["#PCDATA", "em", "strong", "u", "law_wrap", "lawref", "caseref", "casewrap", "commref", "commwrap", "releaseref", "releasewrap", "urlref", "url-wrap"],
                        "attribute": []
                    },
                    "wysiwyg": {
                        "type": "child",
                        "children": ["#PCDATA"],
                        "attribute": []
                    }
                }

                // Ensure the dtdRules object is defined correctly
                if (!dtdRules || !dtdRules[parentName]) {
                    console.warn('No DTD rule found for this element.');
                    return ''; // If no DTD rule for parent, return empty or handle accordingly
                }

                // Get the allowed children for the parent element
                let allowedChildren = dtdRules[parentName].children || [];

                // If the parent element has attributes, get those too
                let allowedAttributes = dtdRules[parentName].attribute || [];

                // Parse the content into an HTML document to check for elements
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                const rootChildNodes = Array.from(doc.body.childNodes);

                // Validate that each node is an allowed child and also check if its attributes are valid
                const isValid = rootChildNodes.every(node => {
                    const nodeName = node.nodeName.toLowerCase();
                    //? Reset the id and cid if any presnt in copy and paste text
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        PasteFilter.Reset_cid_id(node);
                    }
                    // Check if the node is a valid child of the parent element
                    const isChildValid = allowedChildren.includes(nodeName) || nodeName === '#text'; // Allow text nodes

                    if (!isChildValid) return false; // If the child is invalid, return false

                    // If the element has attributes, check if those are allowed
                    //if (node.nodeType === 1) { // Check attributes only for element nodes
                    //    const nodeAttributes = Array.from(node.attributes);
                    //    return nodeAttributes.every(attr => {
                    //        return allowedAttributes.includes(attr.name); // Check if the attribute is allowed
                    //    });
                    //}

                    return true; // If it's a text node, it's valid by default
                });

                // Handle text content (PCDATA)
                const textContentValid = rootChildNodes.every(node => {
                    if (node.nodeType === 3) { // Text node
                        return true; // Always valid text content (PCDATA)
                    }
                    return true;
                });

                // Return valid content or empty string if invalid
                return isValid && textContentValid ? content : '';
            },
            Check_InnerHTML: function(NODE, _ = PasteFilter) {
                try {
                    var IsEmtpy = this.empty_values.includes(NODE.innerHTML) || this.empty_values.includes(NODE.textContent);
                    var [Parent, IsRemoved] = [NODE.parentElement, false];
                    // ? 16_NOV_22 - 
                    if (Parent && this.eventhandler != "copy") {
                        NODE.outerHTML = IsEmtpy ? this.SPACE : this.check_NSNB(NODE);
                        if (Parent.innerHTML == this.SPACE) Parent.outerHTML = this.SPACE;
                    } else if (IsEmtpy) {
                        NODE.remove();
                        IsRemoved = true;
                    }
                } catch (err) {
                    this.ErrorEvent = true;
                    console.warn(err.message + NODE.innerHTML);
                }
            },
            isDisplatPresent: function() {
                var self = PasteFilter;
                try {
                    return self.DOM.querySelectorAll("p,^h,ol,ul,div").length > 0;
                } catch (error) {
                    console.log(error.message);
                }
            },
            after_append_remove: function(el, canAddSpace, options = {}) {
                var self = this;
                // Destructure options with default values

                const {
                    begin = false,
                        after = false,
                        center = false
                } = options;
                try {

                    // New parameters
                    const Parent = el.parentElement;
                    if (!Parent) return;

                    // Determine tag characteristics
                    const remove = /^(FONT)$/i.test(el.tagName);
                    const isFormat = this.formatTagArr.includes(el.tagName);
                    const isAnchor = /^(A)$/i.test(el.tagName);

                    const canConvertPara = begin && !remove && !isFormat && !isAnchor && !self.isDisplatPresent();

                    if (canConvertPara) {
                        console.log("= p created by function==")
                        const pElement = document.createElement('p');

                        if (!Parent.classList.contains("paste-filter")) {
                            Parent.parentElement.replaceChild(el, Parent);

                        } else {
                            while (el.firstChild) {
                                pElement.appendChild(el.firstChild);
                            }

                            if (Parent) {
                                Parent.replaceChild(pElement, el);
                            }
                        }

                    } else {
                        console.log("==002==")
                        // Insert child nodes after the current element, with optional space

                        el.after(canAddSpace ? " " : "", ...el.childNodes);

                        // Remove the original element
                        PasteFilter.removeEl(el);
                    }

                } catch (err) {
                    console.warn(err.message);
                }
            },
            ensureSpaceBetweenObjects: function(objects) {

                for (let i = 0; i < objects.length - 1; i++) {
                    const current = objects[i].element;
                    const next = objects[i + 1].element;

                    if (!current || !next || !current.parentNode) continue;

                    const parent = current.parentNode;
                    const afterCurrent = current.nextSibling;

                    if (!afterCurrent || afterCurrent.nodeType !== Node.TEXT_NODE || afterCurrent.nodeValue.trim() !== '') {
                        const spaceNode = document.createTextNode(' ');
                        parent.insertBefore(spaceNode, next);
                    }
                }
            },
            LoopMethod: function(element, _ = PasteFilter) {
                try {
                    var arr = Array.from(element.childNodes),
                        reverArr = arr.reverse();
                    _.ensureSpaceBetweenObjects(reverArr);
                    reverArr.forEach((node, ind, Arr) => {
                        if (!node) return;
                        if ([7, 4, 8, 10].includes(node.nodeType) || node.nodeType == 1 && _.remove_elm_tags.includes(node.tagName.toLocaleLowerCase())) {

                            PasteFilter.removeEl(node);
                        } else if (node.nodeType == 3) {
                            let trim = node.nodeValue.trim();
                            if (['' /* , ' ', '\\n', '\\n\\n' */ ].includes(trim) || trim.length == 0) {

                                PasteFilter.removeEl(node);
                            } else _.check_NSNB(node);
                        } else if (node.nodeType == 1) {
                            let root = node.parentElement ? node.parentElement : node;
                            if (root.childElementCount > 0) {
                                Array.from(root.querySelectorAll("*")).reverse().forEach((el, ind, Arr) => {
                                    _.node2Text(el);
                                });
                            } else {
                                _.LoopMethod(node);
                            }
                        }
                    });
                } catch (err) {
                    this.ErrorEvent = true;
                    console.warn(err.message);
                }
            },
            removeEl: function(node) {
                try {
                    // console.log('COMMENT REMOVED==> ' + node.nodeValue);
                    //debug.log(node);
                    if (node.parentElement && typeof node.parentElement.removeChild == "function") {
                        node.parentElement.removeChild(node);
                        //debug.warn("----node removed----");
                    } else if (typeof node.remove == "function") {
                        node.remove();
                        //debug.warn("----node removed----");
                    } else {
                        $(node).remove();
                        //debug.log("----node retain----");
                    }
                } catch (err) {
                    console.warn(err.message);
                }
            },
            check_NSNB: function(NODE, _ = PasteFilter) {
                try {
                    var loop = 0;
                    var IsElm = NODE.nodeType == 1 ? true : false;
                    var value = IsElm ? NODE.outerHTML : NODE.nodeValue;
                    this.replace_empty_values.forEach((item, idx, arr) => {
                        while (value.indexOf(item) > 0) {
                            value = value.split(item).join(' ');
                            if (IsElm) NODE.innerHTML = value;
                            else NODE.nodeValue = value;
                            if (loop > 10) {
                                console.log('break_' + loop);
                                break;
                            } else loop++;
                        }
                    });
                    if (value.indexOf('<!--') > -1 && value.indexOf('-->') > -1) {
                        let dom = document.createElement('span');
                        dom.innerHTML = value;
                        if (this.empty_values.includes(dom.textContent) || dom.textContent != value || dom.firstChild.nodeType == 8 && dom.children.length == 0) {
                            value = '';
                        }
                    }
                    return value;
                } catch (err) {
                    this.ErrorEvent = true;
                    console.warn(err.message);
                }
            },
            node2Text: function(el, _ = PasteFilter) {
                try {
                    // ! LOOP START
                    let tag = el.tagName.toLocaleLowerCase();

                    // ! LOOP END
                    if (/^INSERT|^DIV|^DEL|^SPAN/gi.test(el.tagName)) {
                        // ? In -house Tags
                        if (/^INSERT|^SPAN|^DIV/gi.test(el.tagName)) {
                            //el.outerHTML=el.innerHTML
                            _.checkRemoveAttribute(el);
                            _.Check_InnerHTML(el);
                        } else if (el.tagName == 'DEL') {
                            el.remove();
                        }
                    } else if (['input', 'label', 'select', 'button', 'fieldset', 'legend', 'datalist', 'output', 'option', 'optgroup', 'textarea', 'title'].includes(el.tagName.toLocaleLowerCase())) {


                        if (el.tagName.toLocaleLowerCase() == 'textarea') {
                            _.Check_InnerHTML(el);
                        }
                        el.remove();
                    } else if (el.hasAttribute('data-css')) {
                        if (el.getAttribute('data-css') == "ice-format") {
                            [...el.attributes].forEach((attr) => {
                                // if (attr.name != 'data-name')
                                el.removeAttribute(attr.name);
                            });
                        } else if (el.getAttribute('data-css') == "ice-reformat") {
                            _.Check_InnerHTML(el);
                        }
                        // ! out of impact Tags
                    } else if (_.formatTagArr.includes(tag) || ['table', 'td', 'tr', 'thead'].includes(tag)) {
                        if (el.getAttribute('style') !== null) {
                            _.removeAttr(el);
                        } else _.checkRemoveAttribute(el);
                    } else if (el.getAttribute('style') !== null) {
                        _.checkRemoveAttribute(el);
                        console.log("node2Text_last else before if ==>" + el.tagName);
                    } else {
                        console.log("node2Text_last else if ==>" + el.tagName);
                        _.checkRemoveAttribute(el);
                        _.Check_InnerHTML(el);
                    }
                } catch (err) {
                    this.ErrorEvent = true;
                    console.warn(err.message);
                    ErrorLogTrace('node2Text', err.message + el.innerHTML);
                }
            },
            remove_span: function(Options = {}, _ = PasteFilter) {
                //? 07_JULY_2023
                // ? https://stackoverflow.com/questions/60243572/how-to-remove-span-tag-which-has-no-attribute-in-a-html-block-using-javascript-o
                try {
                    var loop = function(divs) {
                        try {
                            Array.from(divs).reverse().forEach((el, idx, arr) => {

                                if (/SPAN|DIV|^A|^FONT/gi.test(el.tagName)) {
                                    let Parent = el.parentElement;
                                    if (el.attributes.length > 0) _.removeAttr(el);
                                    if (Parent && el.attributes.length == 0) {
                                        console.log("remove_span==>" + el.tagName);
                                        _.after_append_remove(el, true, {
                                            begin: !1
                                        });

                                    }
                                }
                            });
                        } catch (err) {
                            console.warn(err.message);
                        }
                    };
                    // ? https://stackoverflow.com/questions/50011892/how-to-select-an-element-that-has-no-attributes
                    var [findEmpty, loop_count] = [this.DOM.querySelectorAll("*"), 0];
                    while (findEmpty.length > 0) {
                        loop(findEmpty);
                        findEmpty = this.DOM.querySelectorAll("*");
                        if (loop_count > 5) {
                            break;
                        } else loop_count++;
                    }
                } catch (err) {
                    console.warn(err.message);
                }
            },
            cleanNode: function(rootNode) {
                // Early return if node is null
                if (!rootNode) return;

                // Start processing from the root node
                PasteFilter.processNode(rootNode);
                return rootNode;
            },
            processNode: function(node) {
                // Skip if node is null
                if (!node) return;

                // Handle text nodes
                if (node.nodeType === Node.TEXT_NODE) {
                    node.nodeValue = node.nodeValue.replace(/\s+/g, ' ').trim();
                    return;
                }

                // Handle element nodes
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.nodeName.toLowerCase();

                    // Process all children first (create a static copy of children array)
                    const children = Array.from(node.childNodes);
                    children.forEach(child => {
                        PasteFilter.processNode(child);
                    });

                    // If the tag is an allowed tag, modify its attributes as needed
                    if (PasteFilter.formatTagArr.includes(tagName)) {
                        // Example: Change a specific attribute value (e.g., add a class)                
                        Formatting_Reset(node);
                        // Add more attribute modifications as needed for other allowed tags
                    } else if (node.parentNode) {
                        // If not an allowed tag, unwrap it
                        // Create a document fragment to hold all remaining children
                        const fragment = document.createDocumentFragment();

                        // Move all remaining children to the fragment
                        while (node.firstChild) {
                            // Skip empty text nodes
                            if (node.firstChild.nodeType === Node.TEXT_NODE &&
                                node.firstChild.nodeValue.trim() === '') {
                                node.removeChild(node.firstChild);
                                continue;
                            }
                            fragment.appendChild(node.firstChild);
                        }

                        // Insert the fragment before the current node
                        node.parentNode.insertBefore(fragment, node);
                        // Remove the empty node
                        node.parentNode.removeChild(node);
                    }
                }
            },
            processNode_Editors: function(node) {
                if (!node) return;

                // Define allowed formatting tags        
                const blockElements = ['para', 'div', 'heading', 'p', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5'];

                // Convert NodeList to Array for safe iteration
                const childNodes = Array.from(node.childNodes);
                let previousWasBlock = false;

                childNodes.forEach((child) => {
                    if (child.nodeType === 1) { // Element node
                        const tagName = child.tagName.toLowerCase();

                        // If it's a block element, unwrap it
                        if (blockElements.includes(tagName)) {
                            const parent = child.parentNode;

                            if (previousWasBlock) {
                                // Add a space or line break between block elements
                                parent.insertBefore(document.createTextNode(' '), child);
                            }

                            previousWasBlock = true; // Mark this as a block element

                            // Process child nodes recursively
                            PasteFilter.processNode_Editors(child);

                            // Move all children of the block element to its parent
                            while (child.firstChild) {
                                parent.insertBefore(child.firstChild, child);
                            }

                            // Remove the original block element
                            parent.removeChild(child);
                        } else {
                            previousWasBlock = false;

                            // If the tag is a formatting tag, retain it
                            if (PasteFilter.formatTagArr.includes(tagName)) {
                                //PasteFilter.processNode_Editor(child);
                            } else {
                                // Unwrap non-formatting elements
                                const parent = child.parentNode;

                                if (parent) {
                                    // Move children to parent while retaining text spacing
                                    while (child.firstChild) {
                                        if (
                                            child.firstChild.nodeType === Node.TEXT_NODE &&
                                            child.firstChild.nodeValue.trim() === ''
                                        ) {
                                            child.removeChild(child.firstChild); // Skip empty text nodes
                                            continue;
                                        }
                                        parent.insertBefore(child.firstChild, child);
                                    }

                                    // Remove the non-formatting tag itself
                                    parent.removeChild(child);
                                }
                            }
                        }
                    } else if (child.nodeType === 3) { // Text node
                        // Normalize spaces in text nodes
                        //child.nodeValue = child.nodeValue.replace(/\s+/g, ' ').trim();
                        previousWasBlock = false; // Reset block tracking for text nodes
                    }
                });
            },

            processNode_Editor: function(node) {
                console.log("==========processNode_Editor===========")
                if (!node) return;
                var blockElements = ['para', 'div', 'heading', 'p', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5'];
                var childNodes = Array.from(node.childNodes); // Convert NodeList to Array
                var previousWasBlock = false; // Track if the previous node was a block element

                childNodes.forEach(function(child) {
                    if (child.nodeType === 1) { // Element node

                        // Check and update 'id' and 'cid' attributes if they exist
                        var idAttr = child.getAttribute('id');
                        var cidAttr = child.getAttribute('data-cid');

                        if (idAttr) {
                            // Example: Update the 'id' attribute (you can apply your logic here)
                            child.setAttribute('id', "NKW -" + Math.random());
                        }
                        if (cidAttr) {
                            child.setAttribute('data-username', window.parent.CurrentUserName),
                                child.setAttribute('data-userstage', window.parent.ProcessName),
                                child.setAttribute('data-time', (new Date()).getTime()),
                                child.setAttribute('data-last-change-time', (new Date()).getTime());
                            child.setAttribute('data-cid', window.parent.generateUUID());
                            if (PasteFilter.formatTagArr.includes(child.tagName.toLocaleLowerCase())) {
                                child.setAttribute('class', "iceformat");
                            }
                        }

                        // If it's a block element (parent or child), unwrap it
                        if (blockElements.includes(child.tagName.toLowerCase())) {
                            var parent = child.parentNode;

                            if (previousWasBlock) {
                                // If the previous element was a block, add space or a line break
                                parent.insertBefore(document.createTextNode(' '), child);
                            }

                            previousWasBlock = true; // Mark this as a block element

                            // Recursively process any child nodes of the current block element
                            PasteFilter.processNode_Editor(child);

                            // Move all the children of the block element into its parent
                            while (child.firstChild) {
                                parent.insertBefore(child.firstChild, child);
                            }

                            // Remove the original block element
                            parent.removeChild(child);
                        } else {
                            previousWasBlock = false; // Reset if it's not a block element
                            PasteFilter.processNode_Editor(child); // Recursively process inline elements and deeper nodes
                        }
                    } else if (child.nodeType === 3) { // Text node
                        previousWasBlock = false; // Reset for text nodes
                    }
                });
            },
            Reset_cid_id: function(node) {
                try {
                    // Check and update 'id' and 'cid' attributes if they exist
                    var idAttr = child.getAttribute('id');
                    var cidAttr = child.getAttribute('data-cid');

                    if (idAttr) {
                        // Example: Update the 'id' attribute (you can apply your logic here)
                        child.setAttribute('id', "NKW -" + window.parent.generateUUID());
                    }
                    if (cidAttr) {
                        child.setAttribute('data-username', window.parent.CurrentUserName),
                            child.setAttribute('data-userstage', window.parent.ProcessName),
                            child.setAttribute('data-time', (new Date()).getTime()),
                            child.setAttribute('data-last-change-time', (new Date()).getTime());
                        child.setAttribute('data-cid', window.parent.generateUUID());
                        if (PasteFilter.formatTagArr.includes(child.tagName.toLocaleLowerCase())) {
                            child.setAttribute('class', "iceformat");
                        }
                    }
                } catch (e) {

                }
            },
            checkRemoveAttribute: function(el, _ = PasteFilter) {
                try {
                    if (el.getAttribute('style') !== null) _.removeAttr(el);

                    let loop = 1,
                        tag = el.tagName,
                        dataName = el.dataset.name || null;
                    // ? 01_AUG_2024 - SRINI REQUEST
                    while (el.attributes.length > 0) {
                        for (var i = 0; i < el.attributes.length; i++) {
                            var attrib = el.attributes[i],
                                IsFormat = (/strong|em|sup|sub|sc/gi.test(tag) || /strong|em|sup|sub|sc/gi.test(dataName)),
                                isValid = IsFormat;
                            if ((!isValid) && attrib.name != 'style') {
                                //debug.log("remove attribute ==>" + attrib.name);
                                el.removeAttribute(attrib.name);
                            }
                        }
                        if (loop > 5) break;
                        else loop++;
                    }
                    if (el.getAttribute('style') == null) _.Check_InnerHTML(el);
                    else _.removeAttr(el);
                } catch (err) {
                    this.ErrorEvent = true;
                    console.warn(err.message);
                }
            },
            removeAttr: function(elem, _ = PasteFilter) {
                try {
                    if (elem.style.display != '' && elem.style.display == "none") {
                        elem.remove();
                    } else {
                        var Styles = elem.getAttribute('style'),
                            StylesArr = [],
                            IsQuery = (_.Option && _.Option.event_from && /query/gi.test(_.Option.event_from));
                        if (!Styles) return;
                        Styles.split(";").forEach(el => {
                            if (!el) return;
                            var [property, value] = el.split(":");
                            property = property.trim();
                            var index = property.indexOf(`"`);
                            if (index > -1) property = property.slice(1);
                            if (_.retain.includes(property)) {
                                value = value.trim();
                                if (property == _.retain[2] && !isNaN(value)) {
                                    if (Number(value) > 400) {
                                        value = 'bold';
                                    } else return;
                                } else if (_.retain.indexOf(property) > -1 && value.match(/normal|none|inherit/gi) != null) {

                                    return;
                                }

                                let iAttr = _.replace_info[property];
                                if (iAttr) {

                                    if (typeof iAttr.class != "undefined") {

                                    } else if (iAttr[value] && iAttr[value].class) {

                                        iAttr = iAttr[value];
                                    } else {
                                        return;
                                    }
                                    if (iAttr.tag) {
                                        let content = elem.innerHTML,
                                            ignoreRemoveParent = false,
                                            newFrag;
                                        if (!elem.hasAttribute('style')) content = elem.outerHTML;

                                        if (elem.childElementCount == 1 && elem.querySelector(iAttr.tag)) {

                                        } else {
                                            newFrag = _.iGetFragment(content, {
                                                tag: iAttr.tag
                                            });
                                        }
                                        // ? 23_MAR_2024_YA
                                        if (/^h/gi.test(elem.tagName)) ignoreRemoveParent = true;
                                        if (elem.parentElement) {
                                            // elem.parentElement.replaceChild(newFrag, elem);
                                            elem.after(newFrag);
                                            if (!ignoreRemoveParent) {
                                                let next = elem.nextElementSibling;
                                                elem.remove();
                                                elem = next;
                                            } else return;
                                        } else {

                                        }
                                    } else if (iAttr.class) {
                                        //elem.setAttribute("data-name", iAttr.class);
                                    }
                                } else {
                                    StylesArr.push(`${property}: ${value}`);
                                }
                            } else if (property) elem.style.removeProperty(property);
                        });
                        elem[StylesArr.length ? 'setAttribute' : 'removeAttribute']('style', StylesArr.join(';'));
                    }
                    _.checkRemoveAttribute(elem);
                } catch (err) {
                    this.ErrorEvent = true;
                    console.warn(err.message);
                }
            },

            isCursorAtBlockBoundary: function(editor, _ = PasteFilter) {
                try {
                    const selection = editor.getSelection();
                    if (!selection) return {
                        atStart: false,
                        atEnd: false
                    };

                    const range = selection.getRanges()[0];
                    if (!range) return {
                        atStart: false,
                        atEnd: false
                    };

                    const container = range.startContainer;
                    const offset = range.startOffset;

                    // Check if the cursor is at the start of the block
                    let atStart = false;
                    let atEnd = false;

                    if (container.type === CKEDITOR.NODE_TEXT) {
                        // Text node: Check if the offset is at the very start
                        atStart = offset === 0;

                        // Check if the offset is at the very end
                        atEnd = offset === container.getLength();
                    } else if (container.type === CKEDITOR.NODE_ELEMENT) {
                        // Element node: Check for start or end inside a block
                        atStart = offset === 0;
                        atEnd = offset === container.getChildCount();
                    }

                    return {
                        atStart,
                        atEnd
                    };

                } catch (e) {

                }


            },
            cleanupElementChildren: function() {
                // Select all elements matching the selector
                const elements = document.querySelectorAll(selector);

                elements.forEach(element => {
                    // Check if the element has only element node children
                    const childNodes = Array.from(element.childNodes);

                    // Filter to keep only element nodes
                    const elementChildren = childNodes.filter(node => node.nodeType === Node.ELEMENT_NODE);

                    if (elementChildren.length === childNodes.length) {
                        // Reverse the children to maintain original order when inserting
                        const reversedChildren = elementChildren.reverse();

                        reversedChildren.forEach(child => {
                            // Add optional space before inserting child nodes
                            if (canAddSpace) {
                                element.insertAdjacentText('beforeend', ' ');
                            }

                            // Move all child nodes of the current child to the parent
                            while (child.firstChild) {
                                element.appendChild(child.firstChild);
                            }

                            // Remove the now-empty child element
                            element.removeChild(child);
                        });
                    }
                });
            }
        };
        var demoFun = function() {
            pastedArray.forEach((val, idx) => {
                console.log(idx);

                var filter = PasteFilter.fire(val, {
                    e: ""
                })

                var frag = document.createRange().createContextualFragment(filter);
                // var el = document.createElement("div")
                // el.id = idx;
                // el.append(frag);
                // outDiv.append(el);

                var ck_el = CKEDITOR.document.createElement("span");
                var body_ck = CKEDITOR.instances.editor1.document.getBody();
                var last = body_ck.getLast();
                last.$.after(frag);
                // ck_el.setHtml(filter);
                // ck_el.setAttribute("id", idx);
                // ck_el.insertAfter(body_ck.getLast());

            })
        }

        var pastedArray = [
            `<p class="hP" origin-xpath="dp6" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">Corporate tax losses brought forward must be deducted in the order in which they were incurred (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425647" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357071/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357071" data-jsfn="callCitationLink" rel="nofollow" id="link-a-26" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(7)</a>).</p><h1 origin-xpath="dha2" class="hP docDisplay" style="box-sizing: inherit; margin: 0px; color: rgb(53, 53, 53); font-size: 1.5rem; font-weight: 500; line-height: 1.25; font-family: &quot;Fira Sans&quot;; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><b style="box-sizing: inherit; margin: 0px; font-weight: 500; font-size: 1.5rem;">Record retention</b></h1><p class="hP" origin-xpath="dp7" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">A taxpayer who has incurred a tax l</p>`,
            `<p class="hP" origin-xpath="dp6" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">there is a recalculation in the amount of an entity’s tax losses, assessable income, allowable deductions or net exempt income for the year, the entity will generally be able to change its choice (or make a choice where one was not originally available). The change must be communicated by written notice to the Commissioner and is subject to the time limits in ITAA36 s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425644" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io702904sl24471042/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io702904sl24471042" data-jsfn="callCitationLink" rel="nofollow" id="link-a-22" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">170</a><span> </span>(<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425645" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447092sl12443437/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447092sl12443437" data-jsfn="callCitationLink" rel="nofollow" id="link-a-23" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶25-300</a>) (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425646" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357076/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357076" data-jsfn="callCitationLink" rel="nofollow" id="link-a-24" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(10)</a><span> </span>to<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038sl1221212879" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357079/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357079" data-jsfn="callCitationLink" rel="nofollow" id="link-a-25" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">(13)</a>). Corporate tax losses brought forward must be deducted in the order in which they were incurred (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425647" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357071/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357071" data-jsfn="callCitationLink" rel="nofollow" id="link-a-26" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(7)</a>).</p><h1 origin-xpath="dha2" class="hP docDisplay" style="box-sizing: inherit; margin: 0px; color: rgb(53, 53, 53); font-size: 1.5rem; font-weight: 500; line-height: 1.25; font-family: &quot;Fira Sans&quot;; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><b style="box-sizing: inherit; margin: 0px; font-weight: 500; font-size: 1.5rem;">Record retention</b></h1><p class="hP" origin-xpath="dp7" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">A taxpayer who has incurred a tax loss should retain records supporting that loss until the end of the statutory record retention period or the end of the statutory period for reviewing assessments for the income year in which the loss is fully deducted, whichever is later (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl57930675" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io944947sl57999640/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io944947sl57999640" data-jsfn="callCitationLink" rel="nofollow" id="link-a-27" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">TD 2007/2</a>).</p><h1 origin-xpath="dha3" class="hP docDisplay" style="box-sizing: inherit; margin: 0px; color: rgb(53, 53, 53); font-size: 1.5rem; font-weight: 500; line-height: 1.25; font-family: &quot;Fira Sans&quot;; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><b style="box-sizing: inherit; margin: 0px; font-weight: 500; font-size: 1.5rem;">Related matters</b></h1><p class="hP" origin-xpath="dp8" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">The carry forward of<span> </span><cite style="box-sizing: inherit; margin: 0px; font-size: inherit;">capital</cite><span> </span>losses is dis</p>`,
            `<div _ngcontent-ng-c448249431="" class="document-title" style="box-sizing: inherit; margin: 0px 0px 0.5rem; font-weight: 500; font-size: 1.75rem; line-height: 1.875rem; color: rgb(53, 53, 53); font-family: &quot;Fira Sans&quot;; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">Deductibility of prior year losses</div><div _ngcontent-ng-c448249431="" class="doc-tag" style="box-sizing: inherit; margin: 0px; display: flex; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><div _ngcontent-ng-c448249431="" class="para-number" style="box-sizing: inherit; margin: 0px 0px 1rem; font-weight: 500; font-size: 0.75rem; line-height: 1rem; letter-spacing: 1px; text-transform: uppercase; color: rgb(117, 117, 117);"><span _ngcontent-ng-c448249431="" style="box-sizing: inherit; margin: 0px;">¶3-060</span></div></div><toast-notification _ngcontent-ng-c448249431="" _nghost-ng-c1349147377="" style="box-sizing: inherit; margin: 0px; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"></toast-notification><div _ngcontent-ng-c448249431="" citationresolve="" class="document-content" style="box-sizing: inherit; margin: 0px; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><div class="dps-resource" id="dps-resource" style="box-sizing: inherit; margin: 0px;"><div class="docInFocus" cshleafnodewkdocid="WKAP_TAL_AUMTG1_REFERENCE" id="ausUio447038Pio447038sl12425622" tocleafnodewkdocid="WKAP_TAL_826846256#teid-79" style="box-sizing: inherit; margin: 0px;"><div class="docContent" style="box-sizing: inherit; margin: 0px; font-weight: 400; font-size: 1rem; line-height: 1.5rem; color: rgb(35, 35, 35);"><div class="content-wrap super-class-explanation" style="box-sizing: inherit; margin: 0px;"><div class="documentContent" origin-xpath="d" style="box-sizing: inherit; margin: 0px; position: sticky;"><p class="hP" origin-xpath="dp" style="box-sizing: inherit; margin: 0px 0px 1.25rem;">A company, like any other taxpayer, is entitled to carry forward losses incurred in one income year for deduction against its assessable income in subsequent years, subject to certain limitations (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425623" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447078sl12438687/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447078sl12438687" data-jsfn="callCitationLink" rel="nofollow" id="link-a-1" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶16-880</a>). Prior year losses are deductible under ITAA97 Div<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425624" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695189sl24357215Ddoc/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695189sl24357215Ddoc" data-jsfn="callCitationLink" rel="nofollow" id="link-a-2" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36</a><span> </span>(ss<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425625" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io1429477sl24357217/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io1429477sl24357217" data-jsfn="callCitationLink" rel="nofollow" id="link-a-3" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-1</a><span> </span>to<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425626" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695202sl24357150/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695202sl24357150" data-jsfn="callCitationLink" rel="nofollow" id="link-a-4" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-45</a>). The loss company and the claiming company must be the same entity (except in limited circumstances where the loss transfer rules (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425627" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447038Pio447038sl46462523/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447038Pio447038sl46462523" data-jsfn="callCitationLink" rel="nofollow" id="link-a-5" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶3-090</a>) can be applied). For example, in<span> </span><cite style="box-sizing: inherit; margin: 0px; font-size: inherit;">Case</cite><span> </span>52/96<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425628" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io540010sl16719595/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io540010sl16719595" data-jsfn="callCitationLink" rel="nofollow" id="link-a-6" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">96 ATC 498</a>, a golf club with prior year lo</p></div></div></div></div></div></div>`,
            `<span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">time if a person or persons (none of them<span> </span></span>`,
            `<p class="hP" origin-xpath="dp5" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">The rules governing the amount to be deducted are as follows:</p>`,
            `<h2 class="css-ka01ix ew01ub02" style="margin-top: 0px; margin-right: ; margin-bottom: ; margin-left: ; padding-top: 0px; padding-right: 0px; padding-bottom: var(--ds-space-100,8px); padding-left: 0px; font-size: 1.42857em; font-style: normal; color: rgb(23, 43, 77); line-height: 1.2; font-weight: var(--ds-font-weight-medium,500); letter-spacing: -0.008em; display: flex; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, &quot;Fira Sans&quot;, &quot;Droid Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">Bring more context to your code</h2><div class="css-1c5pvfe ew01ub03" style="margin: 0px; padding: 0px; display: flex; color: rgb(23, 43, 77); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, &quot;Fira Sans&quot;, &quot;Droid Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">See owners, dependencies, and help resources for your repositories by linking them to a central software catalog.</div>`,
            `<h1 origin-xpath="dha" class="hP docDisplay" style="box-sizing: inherit; margin: 0px; color: rgb(53, 53, 53); font-size: 1.5rem; font-weight: 500; line-height: 1.25; font-family: &quot;Fira Sans&quot;; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><b style="box-sizing: inherit; margin: 0px; font-weight: 500; font-size: 1.5rem;">Company can limit its loss deduction</b></h1>`,
            `<h1 origin-xpath="dha2" class="hP docDisplay" style="box-sizing: inherit; margin: 0px; color: rgb(53, 53, 53); font-size: 1.5rem; font-weight: 500; line-height: 1.25; font-family: &quot;Fira Sans&quot;; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><b style="box-sizing: inherit; margin: 0px; font-weight: 500; font-size: 1.5rem;">Alternative test</b></h1><p class="hP" origin-xpath="dp5" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">The alternativ</p>`,
            `<p class="hP" origin-xpath="dp4" style="box-sizing: inherit; margin: 0px 0px 1.25rem; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">Corporate tax entities (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425631" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447040sl977394377/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447040sl977394377" data-jsfn="callCitationLink" rel="nofollow" id="link-a-12" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶4-440</a>) can limit the amount of available tax losses that they utilise in an income year (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425632" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357061/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357061" data-jsfn="callCitationLink" rel="nofollow" id="link-a-13" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17</a>). This option can prevent wastage of tax losses and enables a corporate tax entity with prior year losses to increase the amount of franking credits that it has available to pay franked dividends.</p>`,
            `<span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">he right to receive more than 50% of any dividends the company may pay (ITAA97 s<span> </span></span><a name="ausUio447038Pio447038sl46462525-ausUio447038Pio447038sl12425661" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io696703sl24375337/income_au" data-query="AUMTG1_HANDLE io696703sl24375337" data-jsfn="callCitationLink" rel="nofollow" id="link-a-11" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;">165-155(1)</a><span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">), and</span>`,
            `<span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">company has maintained the same owners. The “primary test” is applied unless the relevant provision requires the “alternative test” to be applied (ITAA97 ss<span>&nbsp;</span></span><a name="ausUio447038Pio447038sl46462525-ausUio447038Pio447038sl13337594" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io696623sl24373820/income_au" data-query="AUMTG1_HANDLE io696623sl24373820" data-jsfn="callCitationLink" rel="nofollow" id="link-a-6" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;">165-12</a><span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">;<span>&nbsp;</span></span><a name="ausUio447038Pio447038sl46462525-ausUio447038Pio447038sl13337595" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io696632sl24373962/income_au" data-query="AUMTG1_HANDLE io696632sl24373962" data-jsfn="callCitationLink" rel="nofollow" id="link-a-7" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;">165-37</a><span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">;<span>&nbsp;</span></span><a name="ausUio447038Pio447038sl46462525-ausUio447038Pio447038sl13337596" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io696696sl24375198/income_au" data-query="AUMTG1_HANDLE io696696sl24375198" data-jsfn="callCitationLink" rel="nofollow" id="link-a-8" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;">165-123</a><span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">). The alternative test</span>`,
            `<ul class="none" style="box-sizing: inherit; margin: 1rem 0px 1rem 3rem; padding: 0px; list-style-type: square; line-height: 1.7; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><li class="hP none" origin-xpath="dui" style="box-sizing: inherit; margin: 0px; list-style-type: none;">(1) if the entity has no “net exempt income” (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425636" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447078sl12438687/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447078sl12438687" data-jsfn="callCitationLink" rel="nofollow" id="link-a-14" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶16-880</a>), it may choose the amount (if any) of the tax loss that it wishes to deduct from its (otherwise) taxable income (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425637" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357063/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357063" data-jsfn="callCitationLink" rel="nofollow" id="link-a-15" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(2)</a>)</li><li class="hP none" origin-xpath="dui2" style="box-sizing: inherit; margin: 0.5rem 0px 0px; list-style-type: none;">(2) if the entity has net exempt income and also has taxable income (before tax loss deductions), available tax losses must be offset against net exempt income. The entity may then choose the amount (if any) of the remaining tax loss that it wishes to deduct from its (otherwise) taxable income (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425638" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357064/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357064" data-jsfn="callCitationLink" rel="nofollow" id="link-a-16" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(3)</a>)</li><li class="hP none" origin-xpath="dui3" style="box-sizing: inherit; margin: 0.5rem 0px 0px; list-style-type: none;">(3) if the entity has net exempt income and its assessable income is more than offset by its allowable deductions (except tax losses), the excess deductions are subtracted from the net exempt income and the loss brought forward is deducted from any net exempt income that remains. There is no choice in this situation (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425639" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357066/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357066" data-jsfn="callCitationLink" rel="nofollow" id="link-a-17" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(4)</a>)</li><li class="hP none" origin-xpath="dui4" style="box-sizing: inherit; margin: 0.5rem 0px 0px; list-style-type: none;">(4) a choice made under (1) or (2) above must not create excess franking offsets (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl46462517" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447038Pio447038sl46462522/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447038Pio447038sl46462522" data-jsfn="callCitationLink" rel="nofollow" id="link-a-18" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶3-075</a>) for the entity, and must be nil if the entity has excess franking offsets without deducting any tax loss (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425641" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357067/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357067" data-jsfn="callCitationLink" rel="nofollow" id="link-a-19" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(5)</a>;<span> </span><a class="link" href="https://www.ato.gov.au/law/view/document?docid=aid/aid2004685/00001" target="_blank" rel="nofollow" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">ID 2004/685</a>). The reason for this restriction is that old losses could otherwise be “refreshed” by generating excess franking offsets that in turn would be converted to new tax losses (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl46462518" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447038Pio447038sl46462522/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447038Pio447038sl46462522" data-jsfn="callCitationLink" rel="nofollow" id="link-a-20" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶3-075</a>).</li></ul>`,
            `<ul class="none" style="box-sizing: inherit; margin: 1rem 0px 1rem 3rem; padding: 0px; list-style-type: square; line-height: 1.7; color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><li class="hP none" origin-xpath="dui" style="box-sizing: inherit; margin: 0px; list-style-type: none;">(1) if the entity has no “net exempt income” (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425636" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447078sl12438687/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447078sl12438687" data-jsfn="callCitationLink" rel="nofollow" id="link-a-14" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶16-880</a>), it may choose the amount (if any) of the tax loss that it wishes to deduct from its (otherwise) taxable income (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425637" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357063/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357063" data-jsfn="callCitationLink" rel="nofollow" id="link-a-15" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(2)</a>)</li><li class="hP none" origin-xpath="dui2" style="box-sizing: inherit; margin: 0.5rem 0px 0px; list-style-type: none;">(2) if the entity has net exempt income and also has taxable income (before tax loss deductions), available tax losses must be offset against net exempt income. The entity may then choose the amount (if any) of the remaining tax loss that it wishes to deduct from its (otherwise) taxable income (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425638" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357064/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357064" data-jsfn="callCitationLink" rel="nofollow" id="link-a-16" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(3)</a>)</li><li class="hP none" origin-xpath="dui3" style="box-sizing: inherit; margin: 0.5rem 0px 0px; list-style-type: none;">(3) if the entity has net exempt income and its assessable income is more than offset by its allowable deductions (except tax losses), the excess deductions are subtracted from the net exempt income and the loss brought forward is deducted from any net exempt income that remains. There is no choice in this situation (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425639" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357066/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357066" data-jsfn="callCitationLink" rel="nofollow" id="link-a-17" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(4)</a>)</li><li class="hP none" origin-xpath="dui4" style="box-sizing: inherit; margin: 0.5rem 0px 0px; list-style-type: none;">(4) a choice made under (1) or (2) above must not create excess franking offsets (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl46462517" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447038Pio447038sl46462522/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447038Pio447038sl46462522" data-jsfn="callCitationLink" rel="nofollow" id="link-a-18" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶3-075</a>) for the entity, and must be nil if the entity has excess franking offsets without deducting any tax loss (s<span> </span><a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl12425641" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io695193sl24357067/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io695193sl24357067" data-jsfn="callCitationLink" rel="nofollow" id="link-a-19" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">36-17(5)</a>;<span> </span><a class="link" href="https://www.ato.gov.au/law/view/document?docid=aid/aid2004685/00001" target="_blank" rel="nofollow" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">ID 2004/685</a>). The reason for this restriction is that old losses could otherwise be “refreshed” by generating excess franking offsets that in turn would be converted to new tax losses (<a name="ausUio447038Pio447038sl12425622-ausUio447038Pio447038sl46462518" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io447038Pio447038sl46462522/WKAP_TAL_AUMTG1_REFERENCE" data-query="AUMTG1_HANDLE io447038Pio447038sl46462522" data-jsfn="callCitationLink" rel="nofollow" id="link-a-20" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgba(0, 0, 0, 0); text-decoration: none;">¶3-075</a>).</li></ul>`,
            `<span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">company has maintained the same owners. The “primary test” is applied unless the relevant provision requires the “alternative test” to be applied (ITAA97 ss<span> </span></span><a name="ausUio447038Pio447038sl46462525-ausUio447038Pio447038sl13337594" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io696623sl24373820/income_au" data-query="AUMTG1_HANDLE io696623sl24373820" data-jsfn="callCitationLink" rel="nofollow" id="link-a-6" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;">165-12</a><span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">;<span> </span></span><a name="ausUio447038Pio447038sl46462525-ausUio447038Pio447038sl13337595" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io696632sl24373962/income_au" data-query="AUMTG1_HANDLE io696632sl24373962" data-jsfn="callCitationLink" rel="nofollow" id="link-a-7" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;">165-37</a><span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">;<span> </span></span><a name="ausUio447038Pio447038sl46462525-ausUio447038Pio447038sl13337596" class="pointer" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;"></a><a class="link osa-rsi-citation" href="https://iknowconnect.cch.com/AUS/document/resolve-citation/AUMTG1_HANDLE%20io696696sl24375198/income_au" data-query="AUMTG1_HANDLE io696696sl24375198" data-jsfn="callCitationLink" rel="nofollow" id="link-a-8" style="box-sizing: inherit; margin: 0px; color: rgb(0, 91, 146); background-color: rgb(255, 255, 255); text-decoration: none; font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;">165-123</a><span style="color: rgb(35, 35, 35); font-family: &quot;Fira Sans&quot;; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">). The alternative test</span>`
        ]
        var outDiv = document.getElementById('output');

        $(document).on('click', 'button', function() {
            console.log('click :', this.id);

            if (this.id == "out-reset") {



            } else if (this.id == "out-clear") {

            } else if (this.id == "in-reset") {
                CKEDITOR.instances.editor1.setData(initialData);
            } else if (this.id == "in-clear") {
                CKEDITOR.instances.editor1.setData("");

            } else if (this.id == "in-array-data") {
                demoFun();

            }

        });

        function get_p_Data_(data, evt) {


            var dataOne = iGetFragment(data ? data : evt.data.dataValue, {
                tag: 'span'
            }).innerHTML;

            return newValue = PasteFilter.fire(dataOne, {
                event_from: 'shortcut',
                e: evt
            });
        }
        document.addEventListener('DOMContentLoaded', function(event) {
            CKEDITOR.on('instanceReady', function(ev) {

                ev.editor.on('paste', function(evt) {
                    console.log("===paste==")
                    let IsHTMLPaste = evt.data.dataTransfer._.data['text/html'];
                    let newValue = get_p_Data_(IsHTMLPaste, evt);
                    evt.data.dataValue = (newValue);
                })
            })
        })
    
    
});
