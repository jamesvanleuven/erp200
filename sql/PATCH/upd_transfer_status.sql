CREATE OR REPLACE FUNCTION public.upd_transfer_status(_items bigint[], _status integer, _transfer_type)
 RETURNS json
 LANGUAGE sql
AS $function$
/**
 *  set query return for if statement transfer type
 *  if transfer type = adjustment = 3 then
 *      update inventory +/-
 *  else 
 *      check the status
 *      if status = initiated (5) then 
 *      set accepted boolean false on transfer table
 *      set on_hold quantity in inventory table
 *      if status = accepted then
 *          loop through the line-items
 *          make sure the on_hold quantity matches the line item quantity
 *          change status on order
 *          minus from on_hold quantity (could be more than one transfer on hold)
 *          +/- from inventoyr (based on whether it is production or warehouse to warehouse)
 *      end if
 *  end if
 
    pim_transfers.accepted = False (default)
    IF _status === 6 (accepted) THEN
        // change pim_transfers.accepted = True
        // loop through line items
            // pull quantity per product_id
            // remove on_hold amount = quantity
            // remove/add to inventory
    END IF
 
 */

		UPDATE public.pim_transfers 
		SET status_id = _status 
		WHERE id IN (SELECT(unnest(_items::bigint[])));

		SELECT array_to_json(array_agg(row_to_json(t))) 
		FROM (
			SELECT
				a.id,
				a.status_id AS status 
			FROM unnest(_items::bigint[]) id(id)
			LEFT OUTER JOIN public.pim_transfers a ON a.id = id.id 
			ORDER BY a.id
		) t;

$function$;

SELECT * FROM public.upd_transfer_status( ARRAY[26, 27, 28, 29, 30]::bigint[], '5'::integer );