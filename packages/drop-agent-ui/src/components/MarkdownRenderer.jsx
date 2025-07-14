import React from 'react';

export const MarkdownRenderer = ({ content, className = "" }) => {
  if (!content) return null;

  // Parse markdown content into structured elements
  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentParagraph = [];
    let listItems = [];
    let inList = false;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText) {
          elements.push({ type: 'paragraph', content: paragraphText });
        }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push({ type: 'list', items: [...listItems] });
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Empty line handling
      if (!trimmedLine) {
        if (inList) {
          flushList();
        } else {
          flushParagraph();
        }
        return;
      }

      // Headers
      if (trimmedLine.startsWith('# ')) {
        flushParagraph();
        flushList();
        elements.push({ type: 'h1', content: trimmedLine.slice(2) });
        return;
      }
      
      if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        flushList();
        elements.push({ type: 'h2', content: trimmedLine.slice(3) });
        return;
      }

      if (trimmedLine.startsWith('### ')) {
        flushParagraph();
        flushList();
        elements.push({ type: 'h3', content: trimmedLine.slice(4) });
        return;
      }

      // Numbered lists (1. 2. 3. etc.)
      const numberedListMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedListMatch) {
        flushParagraph();
        if (!inList) {
          inList = true;
        }
        listItems.push({
          number: numberedListMatch[1],
          content: numberedListMatch[2]
        });
        return;
      }

      // Bullet lists (- or *)
      const bulletListMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
      if (bulletListMatch) {
        flushParagraph();
        if (!inList) {
          inList = true;
        }
        listItems.push({
          content: bulletListMatch[1],
          bullet: true
        });
        return;
      }

      // Regular text - add to current paragraph
      if (inList) {
        flushList();
      }
      currentParagraph.push(trimmedLine);
    });

    // Flush any remaining content
    flushParagraph();
    flushList();

    return elements;
  };

  // Render inline formatting (bold, italic, code)
  const renderInlineFormatting = (text) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    // Process in order: code, bold, italic
    const processFormatting = (text) => {
      const result = [];
      let remaining = text;

      while (remaining.length > 0) {
        // Inline code (`code`)
        const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/);
        if (codeMatch) {
          if (codeMatch[1]) result.push(codeMatch[1]);
          result.push(
            <code key={key++} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
              {codeMatch[2]}
            </code>
          );
          remaining = codeMatch[3];
          continue;
        }

        // Bold (**text** or __text__)
        const boldMatch = remaining.match(/^(.*?)(\*\*|__)([^*_]+)(\*\*|__)(.*)$/);
        if (boldMatch && boldMatch[2] === boldMatch[4]) {
          if (boldMatch[1]) result.push(boldMatch[1]);
          result.push(
            <strong key={key++} className="font-semibold">
              {boldMatch[3]}
            </strong>
          );
          remaining = boldMatch[5];
          continue;
        }

        // Italic (*text* or _text_)
        const italicMatch = remaining.match(/^(.*?)([*_])([^*_]+)([*_])(.*)$/);
        if (italicMatch && italicMatch[2] === italicMatch[4]) {
          if (italicMatch[1]) result.push(italicMatch[1]);
          result.push(
            <em key={key++} className="italic">
              {italicMatch[3]}
            </em>
          );
          remaining = italicMatch[5];
          continue;
        }

        // No more formatting found, add rest of text
        result.push(remaining);
        break;
      }

      return result;
    };

    return processFormatting(text);
  };

  const elements = parseMarkdown(content);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'h1':
            return (
              <h1 key={index} className="text-xl font-bold mb-3 mt-4 text-gray-900">
                {renderInlineFormatting(element.content)}
              </h1>
            );
          
          case 'h2':
            return (
              <h2 key={index} className="text-lg font-semibold mb-2 mt-3 text-gray-900">
                {renderInlineFormatting(element.content)}
              </h2>
            );
          
          case 'h3':
            return (
              <h3 key={index} className="text-base font-medium mb-2 mt-3 text-gray-900">
                {renderInlineFormatting(element.content)}
              </h3>
            );
          
          case 'paragraph':
            return (
              <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                {renderInlineFormatting(element.content)}
              </p>
            );
          
          case 'list':
            const isNumbered = element.items[0] && element.items[0].number;
            
            if (isNumbered) {
              return (
                <ol key={index} className="mb-4 space-y-2">
                  {element.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="font-semibold text-gray-900 mr-2 mt-0.5 min-w-[1.5rem]">
                        {item.number}.
                      </span>
                      <span className="text-gray-700 leading-relaxed">
                        {renderInlineFormatting(item.content)}
                      </span>
                    </li>
                  ))}
                </ol>
              );
            } else {
              return (
                <ul key={index} className="mb-4 space-y-1">
                  {element.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-gray-500 mr-2 mt-1.5">•</span>
                      <span className="text-gray-700 leading-relaxed">
                        {renderInlineFormatting(item.content)}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            }
          
          default:
            return null;
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;