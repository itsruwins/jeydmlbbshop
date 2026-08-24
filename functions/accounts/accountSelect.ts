/**
 * The embed used everywhere a listing is read with its relations.
 *
 * PostgREST resolves the rank, collection level and images in the same round
 * trip, so a page of 50 listings is one request rather than 151.
 *
 * Kept in one place so the shape the app selects and the `AccountWithRelations`
 * type it is cast to cannot drift apart.
 */
function build(innerCollection: boolean): string {
  return `
    id,
    account_reference,
    price,
    rank_id,
    collection_level_id,
    server,
    account_level,
    hero_count,
    skin_count,
    description,
    status,
    is_featured,
    created_at,
    updated_at,
    rank:ranks (id, name, sort_order),
    collection_level:collection_levels${innerCollection ? "!inner" : ""} (id, name, category, level, sort_order),
    images:account_images (id, account_id, storage_path, alt_text, display_order, is_cover, created_at)
  `;
}

export const ACCOUNT_WITH_RELATIONS_SELECT = build(false);

/**
 * The same embed, but with the collection level joined as `!inner`.
 *
 * Needed only when filtering on a collection-level column. A plain embed is a
 * left join: the filter narrows the embedded object but does not remove the
 * parent row, so a listing outside the range — or one with no collection level
 * at all — would still appear in the results with an empty `collection_level`.
 * `!inner` makes the join restricting, which is what a filter has to be.
 */
export const ACCOUNT_WITH_INNER_COLLECTION_SELECT = build(true);

/**
 * Ordering by a column on an embedded table addresses it by its **alias**, not
 * its table name: `collection_level(sort_order)`, never
 * `collection_levels(sort_order)`. The latter is rejected with "not an embedded
 * resource in this request", because the alias is what exists in the query.
 */
export const COLLECTION_SORT_ORDER_PATH = "collection_level(sort_order)";
