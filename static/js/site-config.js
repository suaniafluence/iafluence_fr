(function () {
    window.IAFLUENCE_CONFIG = {
        links: {
            discoveryCall: "https://calendar.app.google/152ib1czZKq1nBNu5",
            paidSession: "https://calendly.com/suan-tay-job/session-conseil-ia-iafluence",
            stripe1h: "https://book.stripe.com/4gMeVddn0b2V1Pi7Hk9bO03",
            stripe2h: "https://book.stripe.com/bJe14n2Im0oh9hK0eS9bO04",
            stripe3h: "https://book.stripe.com/6oU7sLgzc0oh0Le9Ps9bO05",
            stripe5h: "https://book.stripe.com/14A00jciWdb39hK4v89bO06"
        }
    };

    function applyConfiguredLinks() {
        const links = window.IAFLUENCE_CONFIG.links;
        document.querySelectorAll("[data-iafluence-link]").forEach((element) => {
            const key = element.getAttribute("data-iafluence-link");
            if (links[key]) {
                element.setAttribute("href", links[key]);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyConfiguredLinks);
    } else {
        applyConfiguredLinks();
    }
})();
