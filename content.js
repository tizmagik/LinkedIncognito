const redactionMap = {
  'angel.co': [{
    type: 'class',
    selector: 'title u-fontSize14 u-colorGray3',
    replacement: {
      type: 'text',
      value: '[Candidate Name]'
    }
  }, {
    type: 'class',
    selector: 'photo s-vgRight0_5',
    replacement: {
      type: 'childElement-attribute',
      childElementTag: 'img',
      childElementAttribute: 'src',
      value: 'https://angel.co/images/shared/nopic.png'
    }
  }, {
    type: 'class',
    selector: 'name u-fontSize24 u-fontWeight300 section-title',
    replacement: {
      type: 'childElement-text',
      childElementTag: 'a',
      value: '[Candidate Name]'
    }
  }, {
    type: 'class',
    selector: 'js-browse-table-row-name s-vgRight0_5 candidate-name u-floatLeft',
    replacement: {
      type: 'childElement-text',
      childElementTag: 'a',
      value: '[Candidate Name]'
    }
  }, {
    type: 'class',
    selector: 'photo js-add-photo',
    replacement: {
      type: 'childElement-attribute',
      childElementTag: 'img',
      childElementAttribute: 'src',
      value: 'https://angel.co/images/shared/nopic.png'
    }
  }]
}

function redactElements() {
  const redactions = redactionMap[document.domain];
  for (var i = 0; i < redactions.length; i++) {
    var elements = [];
    if (redactions[i].type === 'class') {
      elements = document.getElementsByClassName(redactions[i].selector);
    } else {
      throw new Error(`Unrecognized selector type: ${redactions[i].type}`);
    }
    for (var j = 0; j < elements.length; j++) {
      redactElement(elements[j], redactions[i].replacement);
    }
  }
}

function redactElement(element, replacementRule) {
  // Don't touch re-redact elements we processed previously
  if (element.getAttribute('data-processed') === null) {
    // Mark this element as having been processed.
    element.setAttribute('data-processes', true);

    // Save the original value to allow for un-redaction
    element.setAttribute('data-original-replacement-rule', replacementRule.type);
    if (replacementRule.type === 'text') {
      element.setAttribute('data-original-value', element.textContent);
      element.textContent = replacementRule.value;
    } else if (replacementRule.type === 'childElement-text') {
      var innerElements = element.getElementsByTagName(replacementRule.childElementTag);
      innerElements[0].setAttribute('data-original-value', innerElements[0].textContent);
      innerElements[0].textContent = replacementRule.value;
    } else if (replacementRule.type === 'childElement-attribute') {
      var innerElements = element.getElementsByTagName(replacementRule.childElementTag);
      innerElements[0].setAttribute('data-original-value', innerElements[0].getAttribute(replacementRule.childElementAttribute));
      innerElements[0].setAttribute('data-original-attribute', replacementRule.childElementAttribute);
      innerElements[0].setAttribute(replacementRule.childElementAttribute, replacementRule.value);
    } else {
      throw new Error(`Unrecognized replacment rule type ${replacementRule.type}`)
    }
  }
}

var interval = 100;
function poller() {
  redactElements();

  // Exponential backoff since AngelList uses React to load the UI and the candidate names
  // But never less often than every 15 seconds
  if (interval < 15000 ) {
    interval *= 2;
  }
  setTimeout(poller, interval);
}

// Execute immediately when the extension is first loaded.
poller();
