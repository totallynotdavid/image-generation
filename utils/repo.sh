#!/bin/bash

# User Configuration
scan_dirs=("src")
ignore_paths=("tests")
ignore_wildcards=("")
root_files=("") # e.g. package.json
allowed_extensions=("ts")

# Function to build ignore clause
build_ignore_clause() {
    local clause=""
    for path in "${ignore_paths[@]}"; do
        clause="$clause -not -path \"*/${path}/*\""
    done
    for wildcard in "${ignore_wildcards[@]}"; do
        clause="$clause -not -path \"*/${wildcard}/*\""
    done
    echo "$clause"
}

# Function to build extension clause
build_extension_clause() {
    local clause=""
    for ext in "${allowed_extensions[@]}"; do
        [ -n "$clause" ] && clause="$clause -o"
        clause="$clause -name \"*.${ext}\""
    done
    echo "$clause"
}

# Build and execute find command for structure
find_files() {
    local ignore_clause
    local ext_clause

    ignore_clause=$(build_ignore_clause)
    ext_clause=$(build_extension_clause)

    # Combine root files and directory search
    {
        # First, find root files (if any)
        for file in "${root_files[@]}"; do
            [ -n "$file" ] && find . -maxdepth 1 -name "$file"
        done

        # Then, find files in scan directories
        for dir in "${scan_dirs[@]}"; do
            eval "find \"$dir\" $ignore_clause -type f \( $ext_clause \)"
        done
    } | sort
}

# Function to strip comments and JSDoc from a TypeScript file
strip_comments() {
    local file="$1"
    # Create a temporary JavaScript file with our comment-stripping code
    local temp_script
    temp_script=$(mktemp)
    
    cat > "$temp_script" << 'ENDSCRIPT'
const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');

// Function to remove comments while preserving code structure
function removeComments(code) {
    // State tracking variables
    let inString = false;
    let inComment = false;
    let inMultilineComment = false;
    let inRegex = false;
    let escaped = false;
    let stringChar = '';
    let result = '';
    
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const nextChar = code[i + 1] || '';
        
        // Handle string state
        if (!inComment && !inMultilineComment && (char === '"' || char === "'") && !escaped) {
            if (!inString) {
                inString = true;
                stringChar = char;
                result += char;
            } else if (char === stringChar) {
                inString = false;
                result += char;
            } else {
                result += char;
            }
            continue;
        }
        
        // Handle regex state
        if (!inComment && !inMultilineComment && !inString && char === '/' && nextChar !== '/' && nextChar !== '*' && !inRegex && !escaped) {
            const prevChar = i > 0 ? code[i - 1] : '';
            // Simple heuristic to detect regex vs division
            if (/[({=,;:?[&|!]/.test(prevChar) || /\s/.test(prevChar)) {
                inRegex = true;
                result += char;
                continue;
            }
        }
        
        if (inRegex && char === '/' && !escaped) {
            inRegex = false;
            result += char;
            continue;
        }
        
        // Handling escape characters
        if ((inString || inRegex) && char === '\\' && !escaped) {
            escaped = true;
            result += char;
            continue;
        } else {
            escaped = false;
        }
        
        // Detect start of single-line comment
        if (!inString && !inComment && !inMultilineComment && !inRegex && char === '/' && nextChar === '/') {
            inComment = true;
            i++; // Skip the next character
            continue;
        }
        
        // Detect end of single-line comment
        if (inComment && char === '\n') {
            inComment = false;
            result += '\n'; // Keep line breaks
            continue;
        }
        
        // Detect start of multi-line comment
        if (!inString && !inComment && !inMultilineComment && !inRegex && char === '/' && nextChar === '*') {
            inMultilineComment = true;
            i++; // Skip the next character
            continue;
        }
        
        // Detect end of multi-line comment
        if (inMultilineComment && char === '*' && nextChar === '/') {
            inMultilineComment = false;
            i++; // Skip the next character
            continue;
        }
        
        // Add character to result if not in a comment
        if (!inComment && !inMultilineComment) {
            result += char;
        } else if (inMultilineComment && char === '\n') {
            // Keep line breaks in multiline comments to preserve line numbers
            result += '\n';
        }
    }
    
    return result;
}

try {
    const cleanedContent = removeComments(content);
    console.log(cleanedContent);
} catch (error) {
    console.error('Error processing file:', error);
    // Fallback to original content
    console.log(content);
}
ENDSCRIPT

    node "$temp_script" "$file"
    rm "$temp_script"
}

# Function to normalize consecutive newlines
normalize_newlines() {
    # Replace runs of 3+ newlines with 2 newlines
    sed -E ':a;N;$!ba;s/\n{3,}/\n\n/g'
}

# Generate output
output="=== File Structure ===\n"

# Add file structure list
while IFS= read -r file; do
    output+="${file#./}\n"
done < <(find_files)

output+="\n=== File Contents ===\n"

# Add file contents with comments stripped
while IFS= read -r file; do
    output+="\n// FILE: ${file#./}\n"
    if [[ "$file" == *.ts ]]; then
        # Handle TypeScript files
        content=$(strip_comments "$file")
        # Normalize the content before adding it to output
        output+="$(echo "$content" | normalize_newlines)\n"
    else
        # Fallback to cat for other files
        content=$(cat "$file")
        output+="$(echo "$content" | normalize_newlines)\n"
    fi
    output+="---\n"
done < <(find_files)

# Remove the last separator
output="${output%---*}"

# Final pass to normalize newlines in the entire output
output=$(echo -e "$output" | normalize_newlines)

# Copy to clipboard
if command -v pbcopy &>/dev/null; then
    # macOS
    echo -e "$output" | pbcopy
    echo "Output copied to clipboard (pbcopy)"
elif command -v xclip &>/dev/null; then
    # Linux with xclip
    echo -e "$output" | xclip -sel clip
    echo "Output copied to clipboard (xclip)"
else
    echo -e "$output"
    echo "Clipboard copy not available, printing to console."
fi
