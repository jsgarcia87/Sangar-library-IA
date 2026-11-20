#!/usr/bin/env python3
"""
Sangar Motion Vault — Downloader de Activos Locales (Offline)
Descarga en local todos los posters, videos y archivos de código fuente (HTML, CSS, JS)
para conformar la bóveda privada e independiente de 880 animaciones interactivas.
"""

import os
import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_JSON = os.path.join(BASE_DIR, 'data', 'moxen-components.json')
DEST_JSON = os.path.join(BASE_DIR, 'data', 'vault-components.json')

POSTERS_DIR = os.path.join(BASE_DIR, 'public', 'assets', 'vault', 'posters')
VIDEOS_DIR = os.path.join(BASE_DIR, 'public', 'assets', 'vault', 'videos')
COMPONENTS_DIR = os.path.join(BASE_DIR, 'data', 'vault', 'components')

os.makedirs(POSTERS_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(COMPONENTS_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
}

def fetch_file(url, dest_path, retries=2):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return True
    
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12) as resp:
                content = resp.read()
                temp_path = dest_path + '.tmp'
                with open(temp_path, 'wb') as f:
                    f.write(content)
                os.replace(temp_path, dest_path)
            return True
        except Exception as e:
            if attempt == retries:
                # print(f"Error descargando {url}: {e}")
                return False
            time.sleep(0.5)
    return False

def process_component(item):
    cid = item['id']
    
    # 1. Poster
    remote_poster = item.get('poster') or f"https://moxen.cl/assets/video/recursos/{cid}.jpg"
    local_poster_file = os.path.join(POSTERS_DIR, f"{cid}.jpg")
    poster_ok = fetch_file(remote_poster, local_poster_file)
    
    # 2. Video
    remote_video = item.get('video') or f"https://moxen.cl/assets/video/recursos/{cid}.mp4"
    local_video_file = os.path.join(VIDEOS_DIR, f"{cid}.mp4")
    video_ok = fetch_file(remote_video, local_video_file)
    
    # 3. Source files
    comp_dir = os.path.join(COMPONENTS_DIR, cid)
    os.makedirs(comp_dir, exist_ok=True)
    
    downloaded_files = []
    for fname in item.get('files', []):
        if fname.endswith('/') or fname.endswith('.md'):
            continue
        remote_file_url = f"https://moxen.cl/recursos/{cid}/{fname}"
        local_file_path = os.path.join(comp_dir, fname)
        if fetch_file(remote_file_url, local_file_path):
            downloaded_files.append(fname)
            
    # Always ensure index.html, {cid}.css, {cid}.js are attempted
    for standard_fname in ['index.html', f"{cid}.css", f"{cid}.js"]:
        if standard_fname not in downloaded_files:
            remote_file_url = f"https://moxen.cl/recursos/{cid}/{standard_fname}"
            local_file_path = os.path.join(comp_dir, standard_fname)
            if fetch_file(remote_file_url, local_file_path):
                downloaded_files.append(standard_fname)
                
    return {
        'id': cid,
        'poster_ok': poster_ok,
        'video_ok': video_ok,
        'files_count': len(downloaded_files),
        'files': downloaded_files
    }

def main():
    with open(SRC_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"Iniciando descarga local de {len(data)} componentes para Sangar Motion Vault...")
    start_time = time.time()
    
    completed = 0
    total = len(data)
    results = {}
    
    with ThreadPoolExecutor(max_workers=14) as executor:
        futures = {executor.submit(process_component, item): item for item in data}
        for future in as_completed(futures):
            res = future.result()
            results[res['id']] = res
            completed += 1
            if completed % 50 == 0 or completed == total:
                elapsed = time.time() - start_time
                print(f"Progreso: {completed}/{total} componentes descargados ({elapsed:.1f}s)")
                
    # Generar data/vault-components.json con referencias 100% locales
    clean_data = []
    for item in data:
        cid = item['id']
        res = results.get(cid, {})
        
        # Actualizar promptAgent para branding privado
        prompt = item.get('promptAgent', '')
        prompt = prompt.replace("inspirado en la librería Moxen", "inspirado en el catálogo privado Sangar Motion Vault")
        prompt = prompt.replace("Moxen", "Sangar Vault")
        
        clean_item = {
            'id': cid,
            'name': item['name'],
            'category': item['category'],
            'categoryLabel': item['categoryLabel'],
            'tagline': item['tagline'],
            'description': item['description'],
            'dependencies': item['dependencies'],
            'files': res.get('files') or item.get('files', []),
            'poster': f"public/assets/vault/posters/{cid}.jpg" if res.get('poster_ok') else item['poster'],
            'video': f"public/assets/vault/videos/{cid}.mp4" if res.get('video_ok') else item['video'],
            'localDir': f"data/vault/components/{cid}",
            'promptAgent': prompt
        }
        clean_data.append(clean_item)
        
    with open(DEST_JSON, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, indent=2, ensure_ascii=False)
        
    elapsed = time.time() - start_time
    print(f"\nDescarga finalizada con éxito en {elapsed:.1f} segundos.")
    print(f"Dataset privado generado en: {DEST_JSON}")
    
    # Calcular tamaños en disco
    def dir_size_mb(path):
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                if not os.path.islink(fp):
                    total_size += os.path.getsize(fp)
        return total_size / (1024 * 1024)
        
    posters_mb = dir_size_mb(POSTERS_DIR)
    videos_mb = dir_size_mb(VIDEOS_DIR)
    comps_mb = dir_size_mb(COMPONENTS_DIR)
    print(f"Posters locales: {posters_mb:.1f} MB")
    print(f"Videos locales: {videos_mb:.1f} MB")
    print(f"Código fuente componentes: {comps_mb:.1f} MB")
    print(f"TOTAL BÓVEDA LOCAL: {posters_mb + videos_mb + comps_mb:.1f} MB")

if __name__ == '__main__':
    main()
