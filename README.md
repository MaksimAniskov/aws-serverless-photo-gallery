# Architecture

![Architecture](README.images/architecture.svg "Architecture")

# Demo

Visit live demo at https://demo-gallery.aniskov.com/
Sign in there using user name ```username```, and password ```password```.

Upon signing in you will see following starting page.

![Demo photo gallery starting page](README.images/demo-starting-page.png "Demo photo gallery starting page")

# Using

The figure above shows so called browse mode when you see thumbnails of images in S3 bucket and navigate folders.

Click subfolder tile to jump to content of the folder.

![Subfolder tile](README.images/subfolder-tile.png "Subfolder tile")

When you're in a subfolder you see arrow tile which will navigate you back to parent folder.

![Arrow tile](README.images/arrow-tile.png "Arrow tile")

Click image thumbnail tile to start viewing photos full-screen.

While it is in full-screen image viewing mode use keyboard keys
```Arrow Left/Right/Up/Down```, ```Page Up/Down```, ```Space```, and ```Enter```,
or swipe left/right on touch screen devices,
to navigate forth and back through the gallery.

Click right mouse button, or long tap touch screen, to pop up context menu.

Use context menu to switch back to browse mode or sign out.

![Context menu](README.images/context-menu.png "Context menu")

# Credits

This works uses [AWS Serverless Image Handler Lambda wrapper for Thumbor](https://github.com/awslabs/serverless-image-handler).

Demo gallery uses images by
<a href="https://pixabay.com/users/Free-Photos-242387/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=768803">Free-Photos</a>,
<a href="https://pixabay.com/users/DEZALB-1045091/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3072341">Albert Dezetter</a>,
<a href="https://pixabay.com/users/Engin_Akyurt-3656355/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1973830">engin akyurt</a>,
<a href="https://pixabay.com/users/Mariamichelle-165491/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3274226">Michelle Maria</a>,
<a href="https://pixabay.com/users/jtyoder-601591/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=542082">Jon Toy</a>,
<a href="https://pixabay.com/users/Connectingdots-919354/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=853048">Peter Vandecaveye</a>
from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=768803">Pixabay</a>.

***
Copyright 2019 Maksim Ansikov MaksimAniskov@gmail.com Read LICENSE.txt