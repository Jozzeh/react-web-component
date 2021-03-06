const template = document.createElement("template");
template.innerHTML = `
<style>
/*tag styles*/
div {
    display: flex;
    justify-content: center;
    flex-direction: row-reverse;
}
img {
    width: 60px;
    height: 60px;
    margin: 10px;
}
p, ::slotted(p) {
    text-align: center;
    font-size: 32px;
    margin: 0;
    padding: 0;
}
/*  This slot will be disabled because it´s only used as a template for the rating stars 
    and have no functionality */
slot[name="rating-star"] {
   display: none; 
}
/*class styles*/
.rating-container {
  border: 3px solid #e3e3e3;
    border-radius: 8px;
    padding: 8px 16px;
    margin-top: 15px;
}
.rating-item {
    filter: grayscale(100%);
    cursor: pointer;
}
.rating-item.selected {
    filter: none;
}
.rating-item:hover, .rating-item:hover ~ .rating-item {
    filter: none;
}
.rating-star {
    display: block;
    -webkit-mask-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 166"><polygon fill="rgb(165,255,214)" points="83 26.8 65.7 61.8 27.1 67.4 55 94.7 48.5 133.2 83 115 117.5 133.2 111 94.7 138.9 67.4 100.3 61.8 83 26.8 83 26.8"/></svg>');
    background-color: #bde45c;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center center;
    width: 80px;
    height: 80px;
}
</style>
<div class="rating-container">
    <slot name="rating-star">
        <div part="icon" class="rating-star"></div>
    </slot>
</div>
`;
export default class Rating extends HTMLElement {
  static get observedAttributes() {
    return ["rating", "max-rating"];
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.element = shadowRoot.querySelector("div");
    const slot = this.element.querySelector("slot");
    this.slotNode = slot.querySelector("div");
    slot.addEventListener("slotchange", (event) => {
      // Take first element of the slot and assign it as new rating star template
      const node = slot.assignedNodes()[0];
      if (node) {
        this.slotNode = node;
        this.render();
      }
    });
  }

  

  get maxRating() {
    // be careful: attributes always string, if you want a number, you must parse it on your own.
    return +this.getAttribute("max-rating");
  }

  set maxRating(value) {
    // if you set the property maxRating in this class, you must sync them with the attribute
    this.setAttribute("max-rating", value);
  }

  get rating() {
    // be careful: attributes always string, if you want a number, you must parse it by your own.
    return +this.getAttribute("rating");
  }

  set rating(value) {
    // if you set the property maxRating in this class, you must sync them with the attribute
    if (value < 0) {
      throw new Error("The rating must be higher than zero.");
    }
    const currentRating = +value;
    if (currentRating > this.maxRating) {
      throw new Error("The rating must be lower than the maximum.");
    }
    this.setAttribute("rating", value);
  }

  connectedCallback() {
    // set default value for maximal rating value
    if (!this.maxRating) {
      this.maxRating = 5;
    } else if (this.maxRating < 0) {
      throw new Error("The rating must be higher than zero.");
    }
    // set default value for rating
    if (!this.rating) {
      this.rating = 0;
    } else if (this.rating < 0 || this.rating > this.maxRating) {
      throw new Error(
        "The rating must be higher than zero and lower than the maximum."
      );
    }
    this.dispatchEvent(
      new CustomEvent("ratingChanged", { detail: this.rating })
    );
    this.render();
  }

  adoptedCallback() {
    console.log("Rating was moved into a new DOM");
  }
  disconnectedCallback() {
    console.log("Rating removed from DOM");
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }

    switch (name) {
      case "rating":
        this.rating = newVal;
        this.updateRating();
        break;
      case "max-rating":
        this.maxRating = newVal;
        this.render();
        break;
      default: 
        break;
    }
  }

  render() {
    this.clearRatingElements();
    for (let i = this.maxRating; i > 0; i--) {
      i = parseInt(i);
      const selected = this.rating ? this.rating >= i : false;
      this.createRatingStar(selected, i);
    }
  }

  clearRatingElements() {
    const nodes = this.element.getElementsByClassName("rating-item");
    if (nodes) {
      while (nodes.length > 0) {
        nodes[0].parentNode.removeChild(nodes[0]);
      }
    }
  }

  createRatingStar(selected, itemId) {
    const ratingTemplate = document.createElement("div");
    ratingTemplate.setAttribute(
      "class",
      selected
        ? `rating-item item-${itemId} selected`
        : `rating-item item-${itemId}`
    );
    ratingTemplate.appendChild(this.slotNode.cloneNode(true));
    ratingTemplate.addEventListener("click", (value) => {
      this.changeRating(itemId);
    });
    this.element.appendChild(ratingTemplate);
  }

  changeRating(event) {
    this.rating = event;
    this.updateRating();
    this.dispatchEvent(
      new CustomEvent("ratingChanged", { detail: this.rating })
    );
  }

  updateRating() {
    for (
      let currentRating = 1;
      currentRating <= this.maxRating;
      currentRating++
    ) {
      let ratingItem = this.element.getElementsByClassName(
        `item-${currentRating}`
      )[0];
      if (ratingItem) {
        if (currentRating <= this.rating) {
          if (ratingItem.className.indexOf("selected") < 0) {
            ratingItem.className = ratingItem.className + " selected";
          }
        } else {
          ratingItem.className = ratingItem.className.replace("selected", "");
        }
      }
    }
  }
}

window.customElements.define("my-rating", Rating);
