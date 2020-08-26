import React from "react";

import "./Webcomponent/Rating";
import useCustomElement from "use-custom-element";

function ReactRating(props) {
  const [customElementProps, ref] = useCustomElement(props);

  return (
    <div>
      {props.title && (<p>{props.title}</p>)}
      <my-rating
        {...customElementProps}
        ref={ref}
      ></my-rating>
    </div>
  );
}

export default ReactRating;
