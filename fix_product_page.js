const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'product', '[handle]', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Move "Related Products" outside the two-column flex, to a full-width row below
// Find the Related Products block and remove it from its current position
const relatedStart = content.indexOf('{/* Related Products */}');
if (relatedStart === -1) {
  console.log('Could not find Related Products section');
  process.exit(1);
}

// Find the closing of the right-side div (</div> after related products block)
// The structure is:
//   {/* Related Products */}
//   {relatedProducts... </div> )}
//   </div>   <-- closes right info div
//   </div>   <-- closes flex row
//   </div>   <-- closes container
//   </div>   <-- closes page wrapper

// We need to:
// a) Remove lines 151-169 (the related products block)
// b) Insert a new full-width related products section after the flex row closes

const lines = content.split(/\r?\n/);

// Remove lines 151-169 (0-indexed: 150-168)
const removedLines = lines.splice(150, 19);

// Now the closing structure is:
// line 150: </div>  (was line 170, closes right info div)  
// line 151: </div>  (was line 171, closes flex row)
// line 152: </div>  (was line 172, closes container)
// line 153: </div>  (was line 173, closes page wrapper)

// We want to insert the new related products section AFTER the flex row closes (after line 151)
// but BEFORE the container closes (before line 152)

const newRelatedSection = [
  '',
  '        {/* Related Products - Full Width Row Below */}',
  '        {relatedProducts.length > 0 && (',
  '          <div className="mt-24 border-t border-border-color pt-16">',
  '            <h3 className="font-serif text-white text-2xl tracking-[0.2em] uppercase mb-12 text-center">You May Also Like</h3>',
  '            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">',
  '              {relatedProducts.map((rp) => (',
  '                <Link key={rp.Handle} href={`/product/${rp.Handle}`} className="group block">',
  '                  {/* eslint-disable-next-line @next/next/no-img-element */}',
  '                  <img',
  '                    src={rp.images?.[0] || "/placeholder.png"}',
  '                    alt={rp.Title}',
  '                    className="w-full aspect-[4/5] object-cover mb-4 group-hover:opacity-80 transition-opacity border border-transparent group-hover:border-gold"',
  '                  />',
  '                  <p className="text-white text-sm font-light tracking-wide truncate mb-1">{rp.Title}</p>',
  "                  <p className=\"text-gold text-xs\">${Number(rp['Variant Price']).toFixed(2)}</p>",
  '                </Link>',
  '              ))}',
  '            </div>',
  '          </div>',
  '        )}',
];

// Find where the flex row div closes. After removing lines, look for the pattern:
// We need to insert after line that closes the flex container (</div> after </div> that closes right info)
// Line 150 should be: </div>  (right info)
// Line 151 should be: </div>  (flex row)
// Insert after line 151

lines.splice(152, 0, ...newRelatedSection);

const newContent = lines.join('\n');
fs.writeFileSync(filePath, newContent);
console.log('Successfully updated product detail page!');
console.log('Lines before:', content.split(/\r?\n/).length);
console.log('Lines after:', newContent.split(/\r?\n/).length);
