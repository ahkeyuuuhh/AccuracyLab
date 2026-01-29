## 🧟 Animated Zombie Model

### Files needed:
1. **zombie.gltf** or **zombie.glb** - Your animated zombie model
2. **textures/** folder - Contains all texture files (.jpg, .png, etc.)
3. Model should include walking/death animations

### Example file structure:
```
zombie/
├── zombie.gltf        ← Main animated zombie model
├── textures/          ← Texture files folder
│   ├── zombie_skin.jpg
│   ├── zombie_clothes.png
│   └── ...
└── README.md          ← This file
```

### Animation requirements:
Your zombie model should have these animations (common names):
- **Walking**: `walk`, `Walk`, `walking`, `Walking`, `run`, `Run`
- **Death**: `death`, `die`, `Dead` (optional)

### Where to get animated zombie models:
1. **[Mixamo](https://www.mixamo.com/)** - Free animated characters
   - Search "zombie"
   - Apply walking/running animations
   - Download as FBX and convert to GLTF

2. **[Sketchfab](https://sketchfab.com/)** - Search "animated zombie"
   - Filter: Free + Downloadable + Animated
   - Look for models with rigged bones

3. **[CGTrader](https://www.cgtrader.com/)** - Professional animated models
4. **[TurboSquid](https://www.turbosquid.com/)** - Search "rigged zombie"

### Performance tips:
- Keep models under 25MB
- Use .glb format for better compression
- Aim for under 15k polygons for smooth performance
- Animations should be baked into the model

### How to add your zombie:
1. Download an animated zombie from Mixamo or Sketchfab
2. Convert to GLTF if needed (use Blender or online converters)
3. Place the .gltf file here as 'zombie.gltf'
4. Copy all texture files to the 'textures/' folder
5. Your zombies will now walk with realistic animations! 🧟‍♂️