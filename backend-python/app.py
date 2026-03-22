from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import os
app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/match', methods=['POST'])
def match():
    data = request.json
    
    lost_description = data.get('lost')
    found_descriptions = data.get('found')
    
    if not lost_description or not found_descriptions:
        return jsonify({'error': 'Missing data'}), 400
    
    lost_embedding = model.encode(lost_description, convert_to_tensor=True)
    found_embeddings = model.encode(found_descriptions, convert_to_tensor=True)
    
    scores = util.cos_sim(lost_embedding, found_embeddings)[0]
    
    results = []
    for i, score in enumerate(scores):
        results.append({
            'index': i,
            'score': float(score),
            'description': found_descriptions[i]
        })
    
    results = sorted(results, key=lambda x: x['score'], reverse=True)
    
    return jsonify({'matches': results})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)