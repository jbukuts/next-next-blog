---
desc: 'Simple way to create a font subset for emojis'
tags: ["python", "fonts"]
created: 4/08/2023
---

# Culling Emojis From Font File

Font files that contain emojis can be extremely large depending on how they're encoded. In the case of this site, I opted to use an open-source [Apple Emoji file](https://github.com/samuelngs/apple-emoji-linux). This font ends up having a size of 45MB which is fine for local use but isn't exactly something you want a user to have to load when they visit your site.

One possible solution to this is instead to use SVGs or some form of image files to represent the emojis. This approach makes using emojis inline a bit harder and more tedious and can make the replacement of the emoji set later on a nuisance.

So let's instead just take a font file containing emojis and create a new one containing only the glyphs we want. That way we can just use the emojis as text anywhere on our site. 

## Using the command line

To create a font file that's a subset I opted to use [fonttools](https://fonttools.readthedocs.io/en/latest/index.html) which allows us to do this both via the command line as well as in our script if we need some flexibility. 

First, you'll need to install the package using `pip` via:

```bash
pip install fonttools
```

Then that's it. We can start to use the tool's CLI. To create a font subset we'll use the `pyftsubset` script that's installed with the package.

```bash
pyftsubset [font_path] --unicodes=U+270C,U+1F9E0,...
```

All we need to do is pass in the font file path as well as a comma-delimited list of the Unicode values representing the emojis and it will spit out a subset font file in our working directory.

Pretty simple. There are a ton of other options as well if you need fine-grain control. All the docs on how to use this script are available [here](https://fonttools.readthedocs.io/en/latest/subset/index.html).

## Writing a simple script

If instead, you would like to like a custom script to do this we can still use the same `fonttools` package from Python to do this. Here's a simple one I wrote in that case:

```python
"""Creates subset font based in input glyphs."""
from pathlib import Path
from operator import attrgetter
import argparse
from fontTools import subset

parser = argparse.ArgumentParser(
                    prog='emojicull',
                    description='Creates subset font.')
parser.add_argument('file_path', help='File path to font')
parser.add_argument('text', help='String containing glyphs in output font')
parser.add_argument('-fw',
    help='Forces woff2 output file', required=False, action='store_true')

def main(cargs):
    """Creates subset font based in input glyphs."""
    file_path, wanted_text, force_woff = attrgetter('file_path', 'text', 'fw')(cargs)

    # ensure file exist and is file
    font_file = Path(file_path)
    if not font_file.is_file():
        print(f'Input path { file_path } is not a file')
        return

    extension, font_name = attrgetter('suffix', 'stem')(font_file)

    # create subset of glyphs based on input
    subsetter = subset.Subsetter()
    subsetter.populate(text=wanted_text)

    font = subset.load_font(file_path, subset.Options())

    # create subset and save output font
    output_options = subset.Options()
    if force_woff:
        output_options.set(flavor='woff2')

    subsetter.subset(font)
    output_ext = ".woff2" if force_woff else extension
    output_path = f'./{font_name}.mini{output_ext}'
    subset.save_font(font, output_path, output_options)

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)
```

To use this script you'd only need 2 positional arguments in the form of:

```bash
python script.py [font_path] 🗓⏰📟☎💻🖱⌨💾💿📺📷...
```

This script is pretty bare bones but does have some nice stuff like `argparse` and is expandable if you'd like to instead parse a directory of fonts and cull all the same glyphs from each of them. Also, I opted to use some unneeded items like the `attrgetter` just because I like its similarity to object destructuring in JavaScript. The above script also has the option to force the newly created subset font to be `woff2` encoded so Lighthouse won't complain.

