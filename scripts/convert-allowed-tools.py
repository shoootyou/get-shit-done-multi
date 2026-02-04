import re
import sys

def convert_tools(content):
    # Find the allowed-tools section with list items
    pattern = r'allowed-tools:\n((?:  - [^\n]+\n)+)'
    
    def replace_tools(match):
        tools_list = match.group(1)
        # Extract tool names
        tools = re.findall(r'  - ([^\n]+)', tools_list)
        # Join with commas
        tools_str = ', '.join(tools)
        return f'allowed-tools: {tools_str}\n'
    
    # Replace the pattern
    new_content = re.sub(pattern, replace_tools, content)
    return new_content

if __name__ == '__main__':
    file_path = sys.argv[1]
    with open(file_path, 'r') as f:
        content = f.read()
    
    new_content = convert_tools(content)
    
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    print(f"Converted: {file_path}")
