
const PREFIXES = [ "add", "aquired", "has", "have", "select", "pick", "choose", "redeem", "ange", "lös in", "mata in", "välj"];
    
const POSTFIXES = [ "kampanj", "rabatt", "rebate", "vouche", "campaign", "coupon", "discount", "kupong", "värde", "value", "promo" ];

const my_event = function (event) {
    if (event.key === 'F2') do_func();
}

document.addEventListener('keydown', event => my_event(event));

const collect_input_elements_without_zip_or_post_attrib = function () {
    keywords = ["post", "postal", "state", "province", "zip"]
    return [...document.querySelectorAll('input')].filter(el =>
        ![...el.attributes].some(attr =>
            keywords.some(k => attr.value.toLowerCase().includes(k.toLowerCase()))
        )
    );
}

const find_candidates = function () {
    INPUT_ELEMENTS = collect_input_elements_without_zip_or_post_attrib();
    let score = [];
    const POSTFIX_PATTERN = /[^>]*(${POSTFIXES.join("|")})[^>]*/i;
    //const pattern = new RegExp(`<input\\b[^>]*\\b(${PREFIXES.join("|")})\\b[^>]*\\b(${POSTFIXES.join("|")})\\b[^>]*/>`, "i");
    // TODO: use the pattern to find candidates
    INPUT_ELEMENTS.forEach(el => {
        if (POSTFIX_PATTERN.test(el.outerHTML)) {
            score.push(el);
        }
    })
    INPUT_ELEMENTS.forEach(el => {
        if (POSTFIX_PATTERN.test(el.outerHTML)) {
            score.push(el);
        }
    })
    if (score.length === 0 ) {
        console.warn("Found no Coupon input field!");
        return null;
    }
    if (score.length > 1) {
        score.forEach(el => {
            // TODO: see which one matches PREFIX before 
            FULL_PATTERN = new RegExp(`<input[^>]*(${PREFIXES.join("|")})[^>]*(${POSTFIXES.join("|")})[^>]*/>`, "i");
            if (!FULL_PATTERN.test(el.outerHTML)) {
                score.remove(el);
            }
        });
        if (score.length === 1) return score[0];
        console.log("Found multiple coupon input fields!");
        return null;
    }
    return score[0];
}

const blink = function(coupon) {
    if (coupon === null) return;
    coupon.parentNode.childNodes.forEach((e) => {
        if (e === coupon)
            e.outerHTML = '<div class="clipp-autofilled">' + e.outerHTML + '</div>'
    })
    
    const STYLE_EL = document.createElement("STYLE");
    STYLE_EL.innerText = `div.clipp-autofilled { animation: blink 2000ms ease-out; } @keyframes blink { 0% { outline: 0px solid white; } 25% { outline: 20px solid darkorange; } 100% { outline: 0px solid white; } }`;
    // add outline styling instead.
    document.body.appendChild(STYLE_EL);
}

const do_func = function (code = "WELCOME20") {
    const COUPON_INPUT = find_candidates();
    if (!COUPON_INPUT) return;
    //TODO make this be what it says in the popup
    COUPON_INPUT.value = code;

    blink(COUPON_INPUT);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "applyCoupon") {
        do_func(request.code);
        sendResponse({ status: "success" });
    }
});
