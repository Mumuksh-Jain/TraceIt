from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import os
import threading
import torch

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Cache and lock for thread-safety and scalability
embeddings_cache = {}
encode_lock = threading.Lock()

@app.route('/match', methods=['POST'])
def match():
    data = request.json
    
    lost_description = data.get('lost')
    found_data = data.get('found')
    
    if not lost_description or not found_data:
        return jsonify({'error': 'Missing data'}), 400
        
    # Check if the old format (list of strings) or new format (list of dicts) is used
    is_legacy = len(found_data) > 0 and isinstance(found_data[0], str)
    
    with encode_lock:
        lost_embedding = model.encode(lost_description, convert_to_tensor=True)
        
        if is_legacy:
            found_descriptions = found_data
            found_embeddings = model.encode(found_descriptions, convert_to_tensor=True)
            scores = util.cos_sim(lost_embedding, found_embeddings)[0]
            
            results = []
            for i, score in enumerate(scores):
                results.append({
                    'index': i,
                    'score': float(score),
                    'description': found_descriptions[i]
                })
        else:
            descriptions = []
            final_embeddings = []
            to_encode_descriptions = []
            to_encode_ids = []
            
            # Identify missing embeddings
            for item in found_data:
                item_id = str(item.get('id', ''))
                desc = item.get('description', '')
                descriptions.append(desc)
                
                if item_id in embeddings_cache:
                    final_embeddings.append(embeddings_cache[item_id])
                else:
                    to_encode_descriptions.append(desc)
                    to_encode_ids.append(item_id)
                    final_embeddings.append(None) # placeholder
            
            # Encode missing ones
            if to_encode_descriptions:
                new_embeddings = model.encode(to_encode_descriptions, convert_to_tensor=True)
                # Map back to cache and final_embeddings
                for i, item_id in enumerate(to_encode_ids):
                    if item_id:
                        embeddings_cache[item_id] = new_embeddings[i]
            
            # Fill the placeholders
            for i, item in enumerate(found_data):
                item_id = str(item.get('id', ''))
                if final_embeddings[i] is None and item_id in embeddings_cache:
                    final_embeddings[i] = embeddings_cache[item_id]
                elif final_embeddings[i] is None:
                    # In case of missing id or other issues, just encode directly
                    final_embeddings[i] = model.encode(descriptions[i], convert_to_tensor=True)
                    
            if not final_embeddings:
                return jsonify({'matches': []})
                
            found_embeddings_tensor = torch.stack(final_embeddings)
            scores = util.cos_sim(lost_embedding, found_embeddings_tensor)[0]
            
            results = []
            for i, score in enumerate(scores):
                results.append({
                    'index': i,
                    'score': float(score),
                    'description': descriptions[i],
                    'id': str(found_data[i].get('id', ''))
                })
            
    results = sorted(results, key=lambda x: x['score'], reverse=True)
    return jsonify({'matches': results})

@app.route("/health")
def health():
    return "OK", 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)